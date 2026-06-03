"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Plus, X, Loader2, Tag, Bell, Trash2, Edit3 } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";

interface Log { _id: string; date: string; description: string; dayOfWeek: string; weekNumber: number; tags?: string[]; reminder?: string; }

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

export default function HomePage() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [reminder, setReminder] = useState("");
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/logs");
      if (res.ok) { const data = await res.json(); setLogs(data.logs); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!date || !description.trim()) return;
    
    // Check if entry for this date already exists (when creating new)
    if (!editId) {
      const existingLog = logs.find(l => new Date(l.date).toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0]);
      if (existingLog) {
        setError("A log for this date already exists. Please edit it instead.");
        return;
      }
    }

    setSaving(true);
    const payload = {
      date,
      description,
      tags: tagsStr.split(",").map(t => t.trim()).filter(Boolean),
      reminder: reminder || null,
    };

    try {
      const url = editId ? `/api/logs/${editId}` : "/api/logs";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save log");
      
      closeSheet(); fetchLogs();
    } catch (err: any) { 
      setError(err.message); 
    } finally { 
      setSaving(false); 
    }
  };

  const deleteLog = async (id: string) => {
    setLogs(logs.filter(l => l._id !== id));
    try { await fetch(`/api/logs/${id}`, { method: "DELETE" }); }
    catch { fetchLogs(); }
  };

  const openNew = () => { 
    setEditId(null); 
    setDate(new Date().toISOString().split("T")[0]); 
    setDescription(""); 
    setTagsStr(""); 
    setReminder(""); 
    setError(""); 
    setShowAdd(true); 
  };
  
  const openEdit = (log: Log) => {
    setEditId(log._id);
    setDate(new Date(log.date).toISOString().split("T")[0]);
    setDescription(log.description);
    setTagsStr(log.tags ? log.tags.join(", ") : "");
    setReminder(log.reminder ? new Date(log.reminder).toISOString().slice(0, 16) : "");
    setError("");
    setShowAdd(true);
  };

  const closeSheet = () => setShowAdd(false);

  if (loading || !session) return <Skeleton />;
  const user = session.user as any;

  // Group logs by week
  const groupedLogs = logs.reduce((acc, log) => {
    if (!acc[log.weekNumber]) acc[log.weekNumber] = [];
    acc[log.weekNumber].push(log);
    return acc;
  }, {} as Record<number, Log[]>);

  const sortedWeeks = Object.keys(groupedLogs).map(Number).sort((a, b) => b - a);

  return (
    <main className="p-5 pb-32 flex-1 mesh-bg min-h-screen">
      <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="mb-6 pt-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-display text-[26px] text-[#1A1A2E]">Logs</h1>
            <p className="text-[13px] font-medium text-black/40 mt-0.5">Welcome back, {user.firstName}</p>
          </div>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, ...spring }}>
            <img src="/clay-home.png" alt="SIWES Logbook" className="w-16 h-16 object-contain clay-pulse drop-shadow-lg mix-blend-multiply" />
          </motion.div>
        </div>
      </motion.header>

      <div className="space-y-6 relative z-10">
        <AnimatePresence>
          {sortedWeeks.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-[1.5rem] p-8 text-center">
              <img src="/clay-home.png" alt="" className="w-20 h-20 object-contain mx-auto mb-3 opacity-50 mix-blend-multiply" />
              <p className="text-[14px] font-medium text-black/40">No logs for this week yet.</p>
              <p className="text-[12px] text-black/30 mt-1">Tap the button below to add your first entry.</p>
            </motion.div>
          ) : (
            sortedWeeks.map((week, idx) => (
              <motion.section
                key={week} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, ...spring }} className="space-y-3"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-black/5" />
                  <span className="text-[11px] font-bold text-black/30 uppercase tracking-widest px-2">Week {week}</span>
                  <div className="h-px flex-1 bg-black/5" />
                </div>
                {groupedLogs[week].map((log, i) => (
                  <motion.div
                    key={log._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05, ...spring }}
                    onClick={() => openEdit(log)}
                    className="glass-card rounded-[1.5rem] p-5 relative overflow-hidden group cursor-pointer hover:bg-black/5 transition-colors"
                  >
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button whileTap={{ scale: 0.8 }} onClick={(e) => { e.stopPropagation(); openEdit(log); }}
                        className="p-1.5 bg-white/70 backdrop-blur-sm text-black/40 hover:text-[#3B5BDB] rounded-lg transition-colors">
                        <Edit3 className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#3B5BDB]/8 flex items-center justify-center border border-[#3B5BDB]/10">
                        <Calendar className="w-4 h-4 text-[#3B5BDB]" />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-700 text-[#1A1A2E] leading-tight">{log.dayOfWeek}</h3>
                        <p className="mono text-[10px] text-black/40 font-bold mt-0.5">
                          {new Date(log.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <p className="text-[13px] text-black/50 leading-relaxed font-medium line-clamp-3 pl-1">
                      {log.description}
                    </p>

                    {(log.tags && log.tags.length > 0 || log.reminder) && (
                      <div className="mt-4 pt-3 border-t border-black/5 flex flex-wrap gap-2 items-center">
                        {log.reminder && (
                          <span className="inline-flex items-center gap-1 text-[10px] mono px-2 py-1 bg-amber-50 text-amber-600 rounded border border-amber-100">
                            <Bell className="w-2.5 h-2.5" />
                            {new Date(log.reminder).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                        {log.tags?.map(t => (
                          <span key={t} className="inline-flex items-center gap-1 text-[10px] mono px-2 py-1 bg-black/5 text-black/50 rounded">
                            <Tag className="w-2.5 h-2.5" /> {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.section>
            ))
          )}
        </AnimatePresence>
      </div>

      <motion.button whileTap={{ scale: 0.93 }} transition={spring} onClick={openNew}
        className="fixed bottom-24 right-5 z-30 w-14 h-14 rounded-full bg-[#3B5BDB] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(59,91,219,0.4)] hover:bg-[#3451C9] transition-colors">
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </motion.button>

      {/* Add / Edit Sheet */}
      <AnimatePresence>
        {showAdd && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeSheet} className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={spring}
              className="fixed bottom-0 left-0 right-0 z-50 glass-card rounded-t-[2rem] p-6 pb-28 flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-5 flex-shrink-0">
                <h3 className="heading-display text-[18px]">{editId ? "Edit Log Entry" : "Add Log Entry"}</h3>
                <motion.button whileTap={{ scale: 0.85 }} onClick={closeSheet}
                  className="w-8 h-8 rounded-full bg-black/6 flex items-center justify-center text-black/40">
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0">
                <form id="logForm" onSubmit={handleSave} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-[12px] font-bold rounded-xl border border-red-100">
                      {error}
                    </div>
                  )}
                  <div>
                    <label className="block text-[11px] font-bold text-black/40 uppercase tracking-wider mb-1.5 ml-1">Date</label>
                    <input type="date" required value={date} onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-3.5 input-premium text-[14px] font-medium" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-black/40 uppercase tracking-wider mb-1.5 ml-1">Daily Log</label>
                    <textarea required value={description} onChange={(e) => setDescription(e.target.value)}
                      placeholder="What did you learn or do today?"
                      className="w-full px-4 py-3.5 input-premium text-[14px] font-medium min-h-[120px] resize-none leading-relaxed" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-black/40 uppercase tracking-wider mb-1.5 ml-1">Tags</label>
                      <div className="relative">
                        <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black/30" />
                        <input type="text" value={tagsStr} onChange={(e) => setTagsStr(e.target.value)}
                          placeholder="e.g. coding, research"
                          className="w-full pl-10 pr-4 py-3.5 input-premium text-[13px] font-medium" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-black/40 uppercase tracking-wider mb-1.5 ml-1">Reminder</label>
                      <div className="relative">
                        <Bell className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black/30" />
                        <input type="datetime-local" value={reminder} onChange={(e) => setReminder(e.target.value)}
                          className="w-full pl-10 pr-4 py-3.5 input-premium text-[12px] font-medium mono" />
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="mt-5 flex gap-3 flex-shrink-0">
                {editId && (
                  <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => { deleteLog(editId); closeSheet(); }}
                    className="py-4 px-5 bg-red-50 text-red-600 rounded-xl font-bold flex items-center justify-center">
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                )}
                <motion.button form="logForm" type="submit" disabled={saving} whileTap={{ scale: 0.97 }}
                  className="flex-1 py-4 btn-primary rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Entry"}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
