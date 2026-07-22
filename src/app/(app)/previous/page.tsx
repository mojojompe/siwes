"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Clock } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";
import { RiveEmptyState } from "@/components/RiveEmptyState";

interface Log { _id: string; date: string; dayOfWeek: string; description: string; weekNumber: number; }

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

export default function PreviousWeeksPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/logs");
      if (res.ok) { const data = await res.json(); setLogs(data.logs); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const currentWeekNum = (() => {
    const d = new Date();
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const pastDaysOfYear = (d.getTime() - startOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  })();

  const previousLogs = logs.filter(l => l.weekNumber < currentWeekNum);
  const groupedByWeek = previousLogs.reduce((acc, log) => {
    if (!acc[log.weekNumber]) acc[log.weekNumber] = [];
    acc[log.weekNumber].push(log);
    return acc;
  }, {} as Record<number, Log[]>);
  const sortedWeeks = Object.keys(groupedByWeek).map(Number).sort((a, b) => b - a);

  if (loading) return <Skeleton />;

  return (
    <main className="p-5 pb-32 flex-1 mesh-bg min-h-screen">
      {/* Header */}
      <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="mb-6 pt-5 pb-4 -mx-5 px-5 sticky top-0 z-[60]">
        <h1 className="heading-display text-[26px] text-[#1A1A2E]">Previous Weeks</h1>
        <p className="text-[13px] font-medium text-black/40 mt-0.5">Review your SIWES history</p>
      </motion.header>

      {sortedWeeks.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-[1.5rem] p-8 text-center">
          <img src="/animations/clay_previous.png" alt="No History" className="w-32 h-32 object-contain mx-auto mb-2 opacity-80 mix-blend-multiply" />
          <p className="text-[14px] font-medium text-black/40">No previous weeks found yet.</p>
          <p className="text-[12px] text-black/30 mt-1">Keep logging daily to see your history here.</p>
        </motion.div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-6 bottom-6 w-[2px] bg-gradient-to-b from-[#6CAADE]/30 via-[#6CAADE]/15 to-transparent rounded-full" />

          <div className="space-y-3 pl-14">
            {sortedWeeks.map((week, wi) => {
              const weekLogs = groupedByWeek[week].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
              const isExpanded = expandedWeek === week;

              return (
                <motion.div
                  key={week}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: wi * 0.06, ...spring }}
                  className="relative"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[3.25rem] top-5 w-4 h-4 rounded-full bg-white border-2 border-[#6CAADE]/40 shadow-[0_0_0_3px_rgba(108,170,222,0.08)]" />

                  <div className="glass-card rounded-[1.5rem] overflow-hidden">
                    <motion.button
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setExpandedWeek(isExpanded ? null : week)}
                      className="w-full p-5 flex items-center justify-between text-left"
                    >
                      <div className="flex items-baseline gap-3">
                        <span className="mono text-[22px] font-700 text-[#6CAADE]">W{week}</span>
                        <div>
                          <p className="text-[14px] font-700 text-[#1A1A2E]">Week {week}</p>
                          <p className="text-[12px] text-black/40 font-medium">
                            {weekLogs.length} {weekLogs.length === 1 ? "entry" : "entries"}
                          </p>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={spring}
                        className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center"
                      >
                        <ChevronDown className="w-4 h-4 text-black/40" />
                      </motion.div>
                    </motion.button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-1 border-t border-black/5 space-y-2.5">
                            {weekLogs.map((log, i) => (
                              <motion.div
                                key={log._id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04, ...spring }}
                                className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/70"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#6CAADE]/8 text-[#6CAADE] rounded-full text-[11px] font-bold border border-[#6CAADE]/10">
                                    <Clock className="w-3 h-3" />
                                    {log.dayOfWeek}
                                  </span>
                                  <span className="mono text-[11px] text-black/35 font-medium">
                                    {new Date(log.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                                  </span>
                                </div>
                                <p className="text-[13px] text-[#1A1A2E] font-medium leading-relaxed">{log.description}</p>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
