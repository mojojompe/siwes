"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, X, Calendar, Loader2, Clock, Bell } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";

interface Todo { _id: string; title: string; completed: boolean; date?: string; reminderTime?: string; }

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

function CircleProgress({ value }: { value: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="relative w-20 h-20">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(59,91,219,0.08)" strokeWidth="6" />
        <motion.circle
          cx="36" cy="36" r={r} fill="none"
          stroke="#3B5BDB" strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="mono text-[18px] font-700 text-[#3B5BDB] leading-none">{value}</span>
        <span className="text-[9px] font-bold text-black/30 uppercase tracking-wider">%</span>
      </div>
    </div>
  );
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  
  const [showSheet, setShowSheet] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newReminder, setNewReminder] = useState("");

  useEffect(() => { fetchTodos(); }, []);

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
    <main className="p-5 pb-32 flex-1 mesh-bg min-h-screen">
      <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="mb-6 pt-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-display text-[26px] text-[#1A1A2E]">Tasks</h1>
            <p className="text-[13px] font-medium text-black/40 mt-0.5">
              {completed} of {todos.length} completed
            </p>
          </div>
          <img src="/clay-todo.png" alt="" className="w-16 h-16 object-contain clay-float drop-shadow-lg mix-blend-multiply" />
        </div>

        {todos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ...spring }}
            className="mt-4 glass-card rounded-[1.5rem] p-4 flex items-center gap-4"
          >
            <CircleProgress value={progress} />
            <div>
              <p className="text-[13px] font-bold text-[#1A1A2E]">Progress</p>
              <p className="text-[12px] text-black/40 mt-0.5">{pending.length} tasks remaining</p>
              <div className="mt-2 h-1.5 w-32 bg-black/6 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#3B5BDB] rounded-full"
                  initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </motion.header>

      <div className="space-y-2.5">
        <AnimatePresence>
          {todos.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-[1.5rem] p-8 text-center">
              <img src="/clay-todo.png" alt="" className="w-20 h-20 object-contain mx-auto mb-3 opacity-50 mix-blend-multiply" />
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
                    ? "bg-[#3B5BDB] border-[#3B5BDB] shadow-[0_2px_8px_rgba(59,91,219,0.3)]"
                    : "border-black/20 hover:border-[#3B5BDB]/50"
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

              <motion.button whileTap={{ scale: 0.8 }} onClick={(e) => { e.stopPropagation(); deleteTodo(todo._id); }}
                className="p-2 rounded-xl text-black/20 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.button whileTap={{ scale: 0.93 }} transition={spring} onClick={openNew}
        className="fixed bottom-24 right-5 z-30 w-14 h-14 rounded-full bg-[#3B5BDB] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(59,91,219,0.4)] hover:bg-[#3451C9] transition-colors">
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
      </AnimatePresence>
    </main>
  );
}
