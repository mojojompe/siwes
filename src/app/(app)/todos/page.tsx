"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, Plus, Loader2, Trash2, Calendar } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";

interface Todo {
  _id: string;
  title: string;
  completed: boolean;
  date?: string;
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [showAdd, setShowAdd] = useState(false);

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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    setAdding(true);
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, date: newDate }),
      });
      if (res.ok) {
        setNewTitle("");
        setNewDate("");
        setShowAdd(false);
        fetchTodos();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const toggleTodo = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    setTodos(todos.map(t => t._id === id ? { ...t, completed: !currentStatus } : t));
    try {
      await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentStatus }),
      });
    } catch (err) {
      console.error(err);
      fetchTodos(); // revert on fail
    }
  };

  const deleteTodo = async (id: string) => {
    setTodos(todos.filter(t => t._id !== id));
    try {
      await fetch(`/api/todos/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error(err);
      fetchTodos(); // revert on fail
    }
  };

  if (loading) {
    return <Skeleton />;
  }

  const completedCount = todos.filter(t => t.completed).length;
  const progress = todos.length === 0 ? 0 : Math.round((completedCount / todos.length) * 100);

  return (
    <main className="p-4 sm:p-8 flex-1">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 text-blue-600 flex items-center justify-center">
            <CheckSquare className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">ToDos</h1>
        </div>
        <p className="text-slate-500 font-medium text-sm">
          Keep track of your tasks and milestones
        </p>

        {todos.length > 0 && (
          <div className="mt-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-bold text-slate-700">Progress</span>
              <span className="text-2xl font-extrabold text-blue-600 leading-none">{progress}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-blue-600 rounded-full"
              />
            </div>
          </div>
        )}
      </header>

      <div className="space-y-3">
        {showAdd ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="bg-white/80 backdrop-blur-2xl rounded-3xl p-5 border border-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] mb-6"
          >
            <form onSubmit={handleAdd} className="space-y-4">
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              />
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-400" />
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-600"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
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
            className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-blue-500 text-slate-500 hover:text-blue-600 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all bg-slate-50/50 hover:bg-blue-50/50 mb-6"
          >
            <Plus className="w-5 h-5" /> Add Task
          </button>
        )}

        <AnimatePresence>
          {todos.length === 0 && !showAdd && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="p-8 text-center bg-white rounded-3xl border border-slate-200"
            >
              <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No tasks yet.</p>
            </motion.div>
          )}
          
          {todos.map((todo) => (
            <motion.div
              key={todo._id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-white/90 backdrop-blur-sm p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 flex items-center gap-3 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group"
            >
              <button
                onClick={() => toggleTodo(todo._id, todo.completed)}
                className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors border-2 ${
                  todo.completed ? "bg-blue-500 border-blue-500 text-white" : "border-slate-300 text-transparent hover:border-blue-400"
                }`}
              >
                <CheckSquare className="w-4 h-4" />
              </button>
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate transition-all ${
                  todo.completed ? "text-slate-400 line-through decoration-slate-300" : "text-slate-700"
                }`}>
                  {todo.title}
                </p>
                {todo.date && (
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                    {new Date(todo.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>

              <button
                onClick={() => deleteTodo(todo._id)}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </main>
  );
}
