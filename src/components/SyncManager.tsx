"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { getOfflineLogs, getOfflineTodos, clearOfflineLog, clearOfflineTodo } from "@/lib/offlineSync";
import { motion, AnimatePresence } from "framer-motion";

export function SyncManager() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);

      const handleOnline = () => {
        setIsOnline(true);
        syncOfflineData();
      };
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // Check for pending data on mount
      checkPendingData();

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  const checkPendingData = async () => {
    try {
      const logs = await getOfflineLogs();
      const todos = await getOfflineTodos();
      setPendingCount(logs.length + todos.length);
    } catch (err) {}
  };

  const syncOfflineData = async () => {
    setIsSyncing(true);
    try {
      const logs = await getOfflineLogs();
      const todos = await getOfflineTodos();

      for (const log of logs) {
        if (log.action === 'create') {
          await fetch('/api/logs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(log.payload) });
        } else if (log.action === 'update') {
          await fetch(`/api/logs/${log.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(log.payload) });
        } else if (log.action === 'delete') {
          await fetch(`/api/logs/${log.id}`, { method: 'DELETE' });
        }
        await clearOfflineLog(log.id);
      }

      for (const todo of todos) {
        if (todo.action === 'create') {
          await fetch('/api/todos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(todo.payload) });
        } else if (todo.action === 'update') {
          await fetch(`/api/todos/${todo.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(todo.payload) });
        } else if (todo.action === 'delete') {
          await fetch(`/api/todos/${todo.id}`, { method: 'DELETE' });
        }
        await clearOfflineTodo(todo.id);
      }
      setPendingCount(0);
    } catch (err) {
      console.error("Sync failed", err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <AnimatePresence>
      {(!isOnline || pendingCount > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.9 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] glass-card bg-white/90 shadow-xl shadow-black/10 rounded-full px-4 py-2 border border-black/5 flex items-center gap-3 pointer-events-auto"
        >
          {!isOnline ? (
            <>
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                <WifiOff className="w-3.5 h-3.5 text-red-500" />
              </div>
              <span className="text-[13px] font-bold text-red-600">You are offline</span>
            </>
          ) : (
            <>
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${isSyncing ? "animate-spin" : ""}`} />
              </div>
              <span className="text-[13px] font-bold text-blue-600">
                {isSyncing ? "Syncing data..." : `${pendingCount} items pending sync`}
              </span>
              {!isSyncing && pendingCount > 0 && (
                <button onClick={syncOfflineData} className="ml-2 text-[11px] font-bold bg-blue-500 text-white px-2 py-1 rounded">Sync Now</button>
              )}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
