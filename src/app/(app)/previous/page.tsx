"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, ChevronDown, Clock, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";

interface Log {
  _id: string;
  date: string;
  dayOfWeek: string;
  description: string;
  weekNumber: number;
}

export default function PreviousWeeksPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

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

  const currentWeekNum = (() => {
    const d = new Date();
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const pastDaysOfYear = (d.getTime() - startOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  })();

  const previousLogs = logs.filter(l => l.weekNumber < currentWeekNum);

  const groupedByWeek = previousLogs.reduce((acc, log) => {
    if (!acc[log.weekNumber]) {
      acc[log.weekNumber] = [];
    }
    acc[log.weekNumber].push(log);
    return acc;
  }, {} as Record<number, Log[]>);

  const sortedWeeks = Object.keys(groupedByWeek)
    .map(Number)
    .sort((a, b) => b - a);

  if (loading) {
    return <Skeleton />;
  }

  return (
    <main className="p-4 sm:p-8 flex-1">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 text-blue-600 flex items-center justify-center">
            <History className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">Previous Weeks</h1>
        </div>
        <p className="text-slate-500 font-medium text-sm">
          Review your past SIWES activity
        </p>
      </header>

      <div className="space-y-4">
        {sortedWeeks.length === 0 ? (
          <div className="p-8 text-center bg-white/80 backdrop-blur-sm rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
            <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No previous weeks found.</p>
          </div>
        ) : (
          sortedWeeks.map((week) => {
            const weekLogs = groupedByWeek[week].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            const isExpanded = expandedWeek === week;

            return (
              <div key={week} className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                <button
                  onClick={() => setExpandedWeek(isExpanded ? null : week)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors focus:outline-none"
                >
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Week {week}</h2>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">
                      {weekLogs.length} {weekLogs.length === 1 ? "entry" : "entries"}
                    </p>
                  </div>
                  <div className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 pt-0 border-t border-white/50 bg-white/40 space-y-3">
                        {weekLogs.map((log) => (
                          <div key={log._id} className="bg-white/90 p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white">
                            <div className="flex items-center justify-between mb-2">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50/50 border border-blue-100/50 text-blue-600 rounded-full text-xs font-bold">
                                <Clock className="w-3.5 h-3.5 text-blue-500" />
                                {log.dayOfWeek}
                              </span>
                              <span className="text-xs font-semibold text-slate-400">
                                {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            <p className="text-slate-700 text-sm font-medium leading-relaxed">
                              {log.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
