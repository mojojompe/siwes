"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Flame, Trophy, Calendar, Target, Check } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

interface StreaksData {
  currentStreak: number;
  longestStreak: number;
  totalLogs: number;
  recentDays: { date: string; dayOfWeek: string; logged: boolean }[];
}

export default function StreaksPage() {
  const router = useRouter();
  const [data, setData] = useState<StreaksData | null>(null);
  const [loading, setLoading] = useState(true);

  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/streaks")
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(console.error);

    fetch("/api/logs")
      .then(res => res.json())
      .then(d => setLogs(d.logs || []))
      .catch(console.error);
  }, []);

  const heatmapDays = (() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 140 days (20 weeks).
    // We want the grid to flow top-to-bottom, left-to-right.
    // But a simple flex container works too.
    for (let i = 139; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const hasLog = logs.some((l: any) => new Date(l.date).toISOString().split("T")[0] === dateStr);
      days.push({ date: dateStr, logged: hasLog });
    }
    return days;
  })();

  if (loading || !data) return <Skeleton />;

  return (
    <main className="p-5 pb-32 flex-1 mesh-bg min-h-screen relative">
      <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="flex items-center gap-4 sticky top-0 z-[60] pt-5 pb-4 -mx-5 px-5 mb-8">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-black/50 border border-black/5 hover:text-black transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
        <h1 className="heading-display text-[22px] text-[#1A1A2E]">Your Streaks</h1>
      </motion.header>

      {/* Main Flame Card */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, ...spring }} className="relative z-10 mb-6">
        <div className="glass-card rounded-[2rem] p-8 text-center overflow-hidden relative border border-orange-500/20 bg-gradient-to-br from-orange-50 to-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-300 via-red-500 to-orange-300" />
          
          <div className="relative inline-block mb-4">
            <motion.div 
              animate={{ scale: [1, 1.05, 1], rotate: [-2, 2, -2] }} 
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className={`w-24 h-24 rounded-full flex items-center justify-center shadow-inner ${data.currentStreak > 0 ? 'bg-gradient-to-t from-orange-500 to-red-400 shadow-orange-500/40' : 'bg-slate-200 shadow-black/10'}`}
            >
              <Flame className={`w-12 h-12 ${data.currentStreak > 0 ? 'text-white drop-shadow-md' : 'text-slate-400'}`} />
            </motion.div>
            {/* Particles */}
            {data.currentStreak > 0 && (
              <>
                <motion.div animate={{ y: [-10, -40], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="absolute top-0 left-1/4 w-2 h-2 rounded-full bg-orange-400" />
                <motion.div animate={{ y: [-10, -30], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="absolute top-0 right-1/4 w-3 h-3 rounded-full bg-red-400" />
                <motion.div animate={{ y: [-10, -50], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.8, delay: 0.8 }} className="absolute top-0 left-1/2 w-2 h-2 rounded-full bg-yellow-400" />
              </>
            )}
          </div>

          <h2 className="heading-display text-[48px] leading-none text-[#1A1A2E] mb-1">{data.currentStreak}</h2>
          <p className="text-[14px] font-bold text-black/40 uppercase tracking-widest">Day Streak</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ...spring }} className="glass-card rounded-[1.5rem] p-5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-3">
            <Trophy className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-[24px] font-bold text-[#1A1A2E] leading-none mb-1">{data.longestStreak}</p>
          <p className="text-[11px] font-bold text-black/40 uppercase tracking-widest">Longest</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, ...spring }} className="glass-card rounded-[1.5rem] p-5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-3">
            <Target className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-[24px] font-bold text-[#1A1A2E] leading-none mb-1">{data.totalLogs}</p>
          <p className="text-[11px] font-bold text-black/40 uppercase tracking-widest">Total Logs</p>
        </motion.div>
      </div>

      {/* Heatmap/Recent Days */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, ...spring }} className="glass-card rounded-[1.5rem] p-6 relative z-10 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <Calendar className="w-5 h-5 text-[#6CAADE]" />
          <h3 className="text-[16px] font-bold text-[#1A1A2E]">Last 14 Days</h3>
        </div>
        
        <div className="flex flex-wrap gap-2 justify-center">
          {data.recentDays.map((day, i) => (
            <div key={day.date} className="flex flex-col items-center gap-1.5">
              <div 
                className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all ${
                  day.logged 
                    ? 'bg-orange-500 border-orange-600 shadow-[0_0_10px_rgba(249,115,22,0.3)]' 
                    : 'bg-black/5 border-black/5'
                }`}
              >
                {day.logged && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
              </div>
              <span className={`text-[10px] font-bold ${i === data.recentDays.length - 1 ? 'text-[#6CAADE]' : 'text-black/30'}`}>
                {i === data.recentDays.length - 1 ? 'Today' : day.dayOfWeek}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* GitHub-style Heatmap */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, ...spring }} className="glass-card rounded-[1.5rem] p-6 relative z-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-emerald-500">
              <path d="M4 4h16v16H4V4z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M4 10h16M10 4v16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-[16px] font-bold text-[#1A1A2E]">Activity Map</h3>
        </div>
        
        <div className="overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-1.5" style={{ width: 'max-content' }}>
            {/* Group days into weeks (columns) */}
            {Array.from({ length: 20 }).map((_, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1.5">
                {heatmapDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day) => (
                  <div
                    key={day.date}
                    title={day.date}
                    className={`w-[14px] h-[14px] rounded-[3px] transition-colors ${
                      day.logged 
                        ? 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.3)] border border-emerald-600' 
                        : 'bg-black/5 border border-black/5'
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-1.5 mt-3 text-[10px] font-bold text-black/40">
          <span>Less</span>
          <div className="w-3 h-3 rounded-[2px] bg-black/5" />
          <div className="w-3 h-3 rounded-[2px] bg-emerald-200" />
          <div className="w-3 h-3 rounded-[2px] bg-emerald-400" />
          <div className="w-3 h-3 rounded-[2px] bg-emerald-500" />
          <span>More</span>
        </div>
      </motion.div>
    </main>
  );
}
