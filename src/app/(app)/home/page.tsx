"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Plus, Clock, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";

interface Log {
  _id: string;
  date: string;
  dayOfWeek: string;
  description: string;
  weekNumber: number;
}

export default function HomePage() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newDesc, setNewDesc] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: newDate, description: newDesc }),
      });
      if (res.ok) {
        setNewDesc("");
        setShowAdd(false);
        fetchLogs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  // Get current week logs
  const currentWeekNum = (() => {
    const d = new Date();
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const pastDaysOfYear = (d.getTime() - startOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  })();

  const currentWeekLogs = logs.filter(l => l.weekNumber === currentWeekNum);

  if (loading) {
    return <Skeleton />;
  }

  return (
    <main className="p-4 sm:p-8 flex-1">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-800">This Week</h1>
        <p className="text-slate-500 font-medium">Week {currentWeekNum}</p>
      </header>

      <div className="space-y-4">
        {currentWeekLogs.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
            <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No logs for this week yet.</p>
          </div>
        ) : (
          currentWeekLogs.map((log) => (
            <motion.div
              key={log._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 mb-4 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50/50 text-blue-600 rounded-full text-xs font-bold border border-blue-100/50">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  {log.dayOfWeek}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <p className="text-slate-700 font-medium leading-relaxed">
                {log.description}
              </p>
            </motion.div>
          ))
        )}

        {showAdd ? (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-2xl p-5 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white mb-6"
          >
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="font-bold text-slate-800 text-sm">Add Today's Log</h2>
            </div>
            <form onSubmit={handleAdd} className="flex flex-col gap-3">
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              />
              <textarea
                required
                rows={3}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="What did you do today?"
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none text-slate-700 font-medium text-sm transition-all"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm flex items-center gap-2 disabled:opacity-70 text-sm transition-colors"
                >
                  {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-blue-500 text-slate-500 hover:text-blue-600 rounded-3xl font-bold flex items-center justify-center gap-2 transition-all bg-slate-50/50 hover:bg-blue-50/50"
          >
            <Plus className="w-5 h-5" /> Add Log Entry
          </button>
        )}
      </div>
    </main>
  );
}
