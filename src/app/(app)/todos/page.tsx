"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Plus, Trash2, X, Calendar, Loader2, Clock, Bell, Play, Pause, Square } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";
import { CircleProgress } from "@/components/CircleProgress";
import { RiveEmptyState } from "@/components/RiveEmptyState";

interface Todo { _id: string; title: string; completed: boolean; date?: string; reminderTime?: string; }

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };


export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  
  const [showSheet, setShowSheet] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newReminder, setNewReminder] = useState("");

  const [focusTask, setFocusTask] = useState<Todo | null>(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => { fetchTodos(); }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      if ("vibrate" in navigator) navigator.vibrate([200, 100, 200, 100, 200]);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const fetchTodos = async () => {
    try {
      const res = await fetch("/api/todos");
      if (res.ok) { const data = await res.json(); setTodos(data.todos); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      if (editId) {
        await fetch(`/api/todos/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle, date: newDate, reminderTime: newReminder }),
        });
      } else {
        await fetch("/api/todos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle, date: newDate, reminderTime: newReminder }),
        });
      }
      closeSheet(); fetchTodos();
    } catch (err) { console.error(err); }
    finally { setAdding(false); }
  };

  const toggleTodo = async (id: string, current: boolean) => {
    if (!current) {
      if ("vibrate" in navigator) navigator.vibrate(50);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 }, colors: ['#6CAADE', '#10B981', '#F59E0B'] });
    }
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

  const openNew = () => { setEditId(null); setNewTitle(""); setNewDate(""); setNewReminder(""); setShowSheet(true); };
  const openEdit = (t: Todo) => { setEditId(t._id); setNewTitle(t.title); setNewDate(t.date || ""); setNewReminder(t.reminderTime || ""); setShowSheet(true); };
  const closeSheet = () => setShowSheet(false);

  if (loading) return <Skeleton />;

  const completed = todos.filter(t => t.completed).length;
  const progress = todos.length === 0 ? 0 : Math.round((completed / todos.length) * 100);
  const pending = todos.filter(t => !t.completed);
  const done = todos.filter(t => t.completed);

  return (
    <main className="p-5 pb-32 flex-1 bg-[#fafafa] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] min-h-screen">
      <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="sticky top-0 z-[60] pt-5 pb-4 -mx-5 px-5 mb-6">
        <h1 className="heading-display text-[26px] text-[#1A1A2E]">Tasks</h1>
        <p className="text-[13px] font-medium text-black/40 mt-0.5">Manage your daily objectives</p>
      </motion.header>

        {todos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ...spring }}
            className="mb-6 glass-card rounded-[1.5rem] p-4 flex items-center gap-4"
          >
            <CircleProgress value={progress} />
            <div>
              <p className="text-[13px] font-bold text-[#1A1A2E]">Progress</p>
              <p className="text-[12px] text-black/40 mt-0.5">{pending.length} tasks remaining</p>
              <div className="mt-2 h-1.5 w-32 bg-black/6 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#6CAADE] rounded-full"
                  initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          </motion.div>
        )}


      <div className="space-y-2.5">
        <AnimatePresence>
          {todos.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-[1.5rem] p-8 text-center">
              <img src="/animations/clay_todos.png" alt="No Tasks" className="w-32 h-32 object-contain mx-auto mb-2 opacity-80 mix-blend-multiply" />
              <p className="text-[14px] font-medium text-black/40">No tasks yet. Add one below!</p>
            </motion.div>
          )}
          {[...pending, ...done].map((todo, i) => (
            <motion.div
              key={todo._id} layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.03, ...spring }}
              onClick={() => openEdit(todo)}
              className={`glass-card rounded-[1.25rem] p-4 flex items-center gap-3.5 group cursor-pointer hover:bg-black/5 transition-colors ${todo.completed ? "opacity-60" : ""}`}
            >
              <motion.button
                whileTap={{ scale: 0.8 }} transition={spring}
                onClick={(e) => { e.stopPropagation(); toggleTodo(todo._id, todo.completed); }}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  todo.completed
                    ? "bg-[#6CAADE] border-[#6CAADE] shadow-[0_2px_8px_rgba(108,170,222,0.3)]"
                    : "border-black/20 hover:border-[#6CAADE]/50"
                }`}
              >
                {todo.completed && (
                  <motion.svg initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3 }}
                    className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                    <motion.path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </motion.svg>
                )}
              </motion.button>

              <div className="flex-1 min-w-0">
                <p className={`text-[14px] font-600 truncate transition-all ${todo.completed ? "line-through text-black/35" : "text-[#1A1A2E]"}`}>
                  {todo.title}
                </p>
                {(todo.date || todo.reminderTime) && (
                  <div className="flex items-center gap-2 mt-1">
                    {todo.date && (
                      <p className="mono text-[10px] px-1.5 py-0.5 rounded bg-black/5 text-black/40 inline-block">
                        {new Date(todo.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    )}
                    {todo.reminderTime && (
                      <p className="mono text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1">
                        <Bell className="w-2.5 h-2.5" />
                        {todo.reminderTime}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {!todo.completed && (
                <motion.button whileTap={{ scale: 0.8 }} onClick={(e) => { e.stopPropagation(); setFocusTask(todo); setTimeLeft(25 * 60); setIsTimerRunning(false); }}
                  className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-4 h-4 ml-0.5" />
                </motion.button>
              )}

              <motion.button whileTap={{ scale: 0.8 }} onClick={(e) => { e.stopPropagation(); deleteTodo(todo._id); }}
                className="p-2 rounded-xl text-black/20 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.button whileTap={{ scale: 0.93 }} transition={spring} onClick={openNew}
        className="fixed bottom-24 right-5 z-30 w-14 h-14 rounded-full bg-[#6CAADE] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(108,170,222,0.4)] hover:bg-[#4A8CC0] transition-colors">
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </motion.button>

      <AnimatePresence>
        {showSheet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeSheet} className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={spring}
              className="fixed bottom-0 left-0 right-0 z-50 glass-card rounded-t-[2rem] p-6 pb-28">
              <div className="flex items-center justify-between mb-5">
                <h3 className="heading-display text-[18px]">{editId ? "Edit Task" : "New Task"}</h3>
                <motion.button whileTap={{ scale: 0.85 }} onClick={closeSheet}
                  className="w-8 h-8 rounded-full bg-black/6 flex items-center justify-center text-black/40">
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full px-4 py-3.5 input-premium text-[14px] font-medium" autoFocus />
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-black/30 flex-shrink-0" />
                    <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3 py-3 input-premium mono text-[12px] font-medium" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-black/30 flex-shrink-0" />
                    <input type="time" value={newReminder} onChange={(e) => setNewReminder(e.target.value)}
                      className="w-full px-3 py-3 input-premium mono text-[12px] font-medium" />
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  {editId && (
                    <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => { deleteTodo(editId); closeSheet(); }}
                      className="py-4 px-5 bg-red-50 text-red-600 rounded-xl font-bold flex items-center justify-center">
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  )}
                  <motion.button type="submit" disabled={adding} whileTap={{ scale: 0.97 }}
                    className="flex-1 py-4 btn-primary rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 disabled:opacity-60">
                    {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Task"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </>
        )}

          {/* Focus Mode Overlay */}
          {focusTask && (
            <motion.div initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }} transition={spring}
              className="fixed bottom-0 left-0 right-0 z-[110] bg-[#1A1A2E] text-white rounded-t-[2rem] p-8 pb-32 flex flex-col items-center shadow-2xl">
              <button onClick={() => setFocusTask(null)} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-indigo-400" />
              </div>
              <p className="text-[14px] font-bold text-white/50 uppercase tracking-widest mb-2">Focusing On</p>
              <h3 className="text-[20px] font-bold text-center mb-8 px-4 leading-tight">{focusTask.title}</h3>
              
              <div className="text-[72px] font-bold font-mono tracking-tighter leading-none mb-10 text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 to-white">
                {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
              
              <div className="flex items-center gap-6">
                <button onClick={() => { setTimeLeft(25 * 60); setIsTimerRunning(false); }} className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Square className="w-5 h-5 text-white/70" fill="currentColor" />
                </button>
                <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:scale-105 transition-transform">
                  {isTimerRunning ? <Pause className="w-8 h-8 text-white" fill="currentColor" /> : <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </main>
  );
}
