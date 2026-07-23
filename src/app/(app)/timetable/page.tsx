"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, X, Loader2, CheckSquare, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";
import { Footer } from "@/components/Footer";

interface Todo { _id: string; title: string; completed: boolean; date?: string; reminderTime?: string; }
const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

export default function TimetablePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showDayView, setShowDayView] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchTodos(); }, []);

  const fetchTodos = async () => {
    try {
      const res = await fetch("/api/todos");
      if (res.ok) { const data = await res.json(); setTodos(data.todos); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const openDayView = (day: number) => {
    const d = `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    setSelectedDateStr(d);
    setNewTitle("");
    setShowDayView(true);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/todos", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, date: selectedDateStr }),
      });
      setNewTitle(""); fetchTodos();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const toggleTodo = async (id: string, current: boolean) => {
    setTodos(todos.map(t => t._id === id ? { ...t, completed: !current } : t));
    try {
      await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !current }),
      });
    } catch { fetchTodos(); }
  };

  const deleteTodo = async (id: string) => {
    setTodos(todos.filter(t => t._id !== id));
    try { await fetch(`/api/todos/${id}`, { method: "DELETE" }); }
    catch { fetchTodos(); }
  };

  if (loading) return <Skeleton />;

  const dayTodos = todos.filter(t => t.date === selectedDateStr);
  const selectedDateDisplay = selectedDateStr 
    ? new Date(selectedDateStr).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
    : "";

  return (
    <main className="p-5 pb-32 flex-1 mesh-bg min-h-screen flex flex-col">
      <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="flex items-center justify-between sticky top-0 z-[60] pt-5 pb-4 -mx-5 px-5 mb-6">
        <div>
          <h1 className="heading-display text-[26px] text-[#1A1A2E]">Schedule</h1>
          <p className="text-[13px] font-medium text-black/40 mt-0.5">Your daily timetable</p>
        </div>
      </motion.header>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ...spring }}
        className="glass-card rounded-[1.75rem] overflow-hidden flex-1 flex flex-col">
        
        {/* Calendar Header */}
        <div className="bg-[#6CAADE] px-5 py-4 flex items-center justify-between">
          <h2 className="heading-display text-[18px] text-white">
            {monthName} <span className="font-400 opacity-70">{year}</span>
          </h2>
          <div className="flex gap-1">
            <motion.button whileTap={{ scale: 0.85 }} onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.85 }} onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 bg-[#6CAADE]/8 border-b border-black/5">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="py-2.5 text-center text-[11px] font-bold text-black/35 uppercase tracking-wider">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 flex-1">
          {blanks.map(b => <div key={`b${b}`} className="border-r border-b border-black/5 bg-black/1" />)}
          {days.map(d => {
            const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
            const dtodos = todos.filter(t => t.date === dateStr);
            const isToday = new Date().toISOString().split("T")[0] === dateStr;

            return (
              <motion.div
                key={d}
                whileTap={{ scale: 0.94, backgroundColor: "rgba(108,170,222,0.06)" }}
                onClick={() => openDayView(d)}
                className={`border-r border-b border-black/5 p-2 relative cursor-pointer group flex flex-col min-h-[72px] transition-colors hover:bg-[#6CAADE]/4 ${
                  isToday ? "bg-[#6CAADE]/5" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[12px] font-bold w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                    isToday
                      ? "bg-[#6CAADE] text-white shadow-[0_2px_8px_rgba(108,170,222,0.4)]"
                      : "text-black/50 group-hover:text-[#6CAADE]"
                  }`}>{d}</span>
                  {dtodos.length > 0 && (
                    <span className="mono text-[9px] font-bold text-[#6CAADE] opacity-60">{dtodos.length}</span>
                  )}
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  {dtodos.slice(0, 2).map(t => (
                    <div key={t._id} className={`text-[9px] px-1.5 py-0.5 rounded font-medium truncate ${
                      t.completed ? "text-black/30 line-through" : "bg-[#6CAADE]/10 text-[#6CAADE]"
                    }`}>{t.title}</div>
                  ))}
                  {dtodos.length > 2 && (
                    <div className="text-[9px] text-black/30 font-bold mono">+{dtodos.length - 2}</div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <div className="mt-8">
        <Footer />
      </div>

      {/* Day View Sheet */}
      <AnimatePresence>
        {showDayView && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowDayView(false)} className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={spring}
              className="fixed bottom-0 left-0 right-0 z-50 glass-card rounded-t-[2rem] flex flex-col max-h-[85vh]">
              
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-black/5 flex-shrink-0">
                <div>
                  <h3 className="heading-display text-[18px]">Day Schedule</h3>
                  <p className="mono text-[12px] text-black/40 mt-0.5">{selectedDateDisplay}</p>
                </div>
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => setShowDayView(false)}
                  className="w-8 h-8 rounded-full bg-black/6 flex items-center justify-center text-black/40">
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Tasks List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {dayTodos.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-[14px] text-black/40 font-medium">No actions scheduled for this day.</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {dayTodos.map(t => (
                      <motion.div key={t._id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        className={`flex items-center gap-3 p-3.5 bg-white/60 rounded-[1rem] border border-white/80 group ${t.completed ? "opacity-50" : ""}`}>
                        <motion.button whileTap={{ scale: 0.8 }} transition={spring} onClick={() => toggleTodo(t._id, t.completed)}
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            t.completed ? "bg-[#6CAADE] border-[#6CAADE] shadow-[0_2px_8px_rgba(108,170,222,0.3)]" : "border-black/20 hover:border-[#6CAADE]/50"
                          }`}>
                          {t.completed && (
                            <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                              <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </motion.button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[14px] font-600 truncate transition-all ${t.completed ? "line-through text-black/35" : "text-[#1A1A2E]"}`}>{t.title}</p>
                        </div>
                        <motion.button whileTap={{ scale: 0.8 }} onClick={() => deleteTodo(t._id)}
                          className="p-1.5 rounded-lg text-black/30 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Add New Task Form */}
              <form onSubmit={handleAddTask} className="p-5 pb-28 border-t border-black/5 bg-black/5 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="New action..."
                    className="flex-1 px-4 py-3 input-premium text-[14px] font-medium" />
                  <motion.button type="submit" disabled={saving} whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 btn-primary rounded-xl flex items-center justify-center disabled:opacity-60 flex-shrink-0">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  </motion.button>
                </div>
              </form>
              
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
