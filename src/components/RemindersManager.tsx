"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";

interface Toast {
  id: string;
  title: string;
  body: string;
}

export function RemindersManager() {
  const { data: session } = useSession();
  const checkedReminders = useRef<Set<string>>(new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (!session?.user) return;

    const subscribeToPush = async () => {
      try {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/sw.js');
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
          });
          
          await fetch('/api/web-push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription)
          });
        }
      } catch (err) {
        console.error("Failed to subscribe to push", err);
      }
    };

    // Request system notification permission
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          subscribeToPush();
        }
      });
    } else if (Notification.permission === "granted") {
      subscribeToPush();
    }


    const checkReminders = async () => {
      try {
        const now = new Date();
        const currentTimeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
        const currentDateStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split("T")[0];

        // Fetch logs
        const logsRes = await fetch("/api/logs");
        if (logsRes.ok) {
          const { logs } = await logsRes.json();
          logs.forEach((log: any) => {
            if (log.reminder) {
              const reminderDate = new Date(log.reminder);
              if (
                reminderDate.getDate() === now.getDate() &&
                reminderDate.getMonth() === now.getMonth() &&
                reminderDate.getFullYear() === now.getFullYear() &&
                reminderDate.getHours() === now.getHours() &&
                reminderDate.getMinutes() === now.getMinutes()
              ) {
                const id = `log-${log._id}`;
                if (!checkedReminders.current.has(id)) {
                  checkedReminders.current.add(id);
                  sendNotification("Daily Log Reminder", { body: log.description }, "log", log._id, "/home");
                }
              }
            }
          });
        }

        // Fetch todos
        const todosRes = await fetch("/api/todos");
        if (todosRes.ok) {
          const { todos } = await todosRes.json();
          todos.forEach((todo: any) => {
            if (!todo.completed && todo.date === currentDateStr && todo.reminderTime === currentTimeStr) {
              const id = `todo-${todo._id}`;
              if (!checkedReminders.current.has(id)) {
                checkedReminders.current.add(id);
                sendNotification("Task Reminder", { body: todo.title }, "task", todo._id, "/todos");
              }
            }
          });
        }
      } catch (err) {
        console.error("Failed to check reminders:", err);
      }
    };

    // Check immediately, then every 30 seconds
    checkReminders();
    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [session]);

  const sendNotification = (title: string, options: NotificationOptions, type: string = "system", relatedId?: string, actionLink?: string) => {
    // System-level notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        icon: "/icons/icon-192x192.png",
        ...options,
      });
    }
    
    // In-app Toast
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, title, body: options.body || "" }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 8000); // hide after 8 seconds

    // Save to Database
    fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        message: options.body || "",
        type,
        relatedId,
        actionLink
      })
    }).catch(console.error);
  };

  return (
    <div className="fixed top-5 left-0 right-0 z-[200] flex flex-col items-center gap-3 pointer-events-none px-4">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="w-full max-w-sm glass-card bg-white/90 shadow-xl shadow-black/10 rounded-[1.25rem] p-4 pointer-events-auto flex items-start gap-3 border border-black/5"
          >
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bell className="w-5 h-5 text-amber-500 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[14px] font-bold text-[#1A1A2E]">{toast.title}</h4>
              <p className="text-[13px] text-black/60 font-medium leading-relaxed mt-0.5">{toast.body}</p>
            </div>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="p-1.5 rounded-full hover:bg-black/5 text-black/40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
