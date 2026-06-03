"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

export function RemindersManager() {
  const { data: session } = useSession();
  const checkedReminders = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!session?.user) return;

    // Request system notification permission
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }

    const checkReminders = async () => {
      try {
        const now = new Date();
        const currentTimeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
        const currentDateStr = now.toISOString().split("T")[0];

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
                  sendNotification("Daily Log Reminder", { body: log.description });
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
                sendNotification("Task Reminder", { body: todo.title });
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

  const sendNotification = (title: string, options: NotificationOptions) => {
    // System-level notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        icon: "/icons/icon-192x192.png",
        ...options,
      });
    }
    // TODO: add in-app toast notification if needed
  };

  return null;
}
