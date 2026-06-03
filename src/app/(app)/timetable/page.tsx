"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, X, Loader2, CheckSquare } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";

interface Todo {
  _id: string;
  title: string;
  completed: boolean;
  date?: string;
}

export default function TimetablePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showAdd, setShowAdd] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await fetch("/api/todos");
      if (res.ok) {
        const data = await res.json();
        setTodos(data.todos);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const openAddForDate = (day: number) => {
    const paddedMonth = (month + 1).toString().padStart(2, '0');
    const paddedDay = day.toString().padStart(2, '0');
    setSelectedDateStr(`${year}-${paddedMonth}-${paddedDay}`);
    setNewTitle("");
    setShowAdd(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    setSaving(true);
    try {
      await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, date: selectedDateStr }),
      });
      setShowAdd(false);
      fetchTodos();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Skeleton />;
  }

  return (
    <main className="p-4 sm:p-8 flex-1 flex flex-col">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 text-blue-600 flex items-center justify-center">
              <CalendarIcon className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800">Timetable</h1>
          </div>
          <p className="text-slate-500 font-medium text-sm">
            Schedule your actions and reminders
          </p>
        </div>
      </header>

      <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-white/50 flex items-center justify-between bg-white/40">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {monthName} <span className="text-slate-400 font-medium">{year}</span>
          </h2>
          <div className="flex gap-1">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 border-b border-white/50 bg-white/30">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {blanks.map(b => (
            <div key={`blank-${b}`} className="border-r border-b border-white/50 bg-white/20" />
          ))}
          {days.map(d => {
            const paddedMonth = (month + 1).toString().padStart(2, '0');
            const paddedDay = d.toString().padStart(2, '0');
            const dateStr = `${year}-${paddedMonth}-${paddedDay}`;
            const dayTodos = todos.filter(t => t.date === dateStr);
            const isToday = new Date().toISOString().split("T")[0] === dateStr;

            return (
              <div 
                key={d} 
                onClick={() => openAddForDate(d)}
                className={`border-r border-b border-white/50 p-2 relative group cursor-pointer transition-colors hover:bg-blue-50/40 flex flex-col min-h-[80px] sm:min-h-[100px] ${
                  isToday ? "bg-blue-50/20" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-xs sm:text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday ? "bg-blue-600 text-white shadow-md" : "text-slate-600 group-hover:text-blue-600"
                  }`}>
                    {d}
                  </span>
                  <Plus className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-1 no-scrollbar mt-1">
                  {dayTodos.map(todo => (
                    <div 
                      key={todo._id} 
                      className={`text-[10px] sm:text-xs px-1.5 py-1 rounded-md truncate font-medium border ${
                        todo.completed 
                          ? "bg-slate-100 text-slate-400 border-slate-200 line-through" 
                          : "bg-white text-slate-700 border-slate-200 shadow-sm"
                      }`}
                    >
                      {todo.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-white/80 backdrop-blur-2xl w-full max-w-sm rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white overflow-hidden"
            >
              <div className="flex justify-between items-center p-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                  Add Action
                </h2>
                <button onClick={() => setShowAdd(false)} className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-4 flex flex-col gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-3">
                  <CalendarIcon className="w-5 h-5 text-slate-400" />
                  <span className="text-sm font-bold text-slate-600">
                    {new Date(selectedDateStr).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Task, Reminder, or Action"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800"
                />
                
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdd(false)}
                    className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm flex items-center gap-2 disabled:opacity-70 text-sm transition-colors"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
