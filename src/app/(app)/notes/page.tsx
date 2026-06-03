"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Plus, Loader2, Trash2, X, Edit3 } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";

interface Note {
  _id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/notes");
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    setSaving(true);
    try {
      if (editId) {
        await fetch(`/api/notes/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content }),
        });
      } else {
        await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content }),
        });
      }
      closeModal();
      fetchNotes();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      setNotes(notes.filter(n => n._id !== id));
      await fetch(`/api/notes/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error(err);
      fetchNotes();
    }
  };

  const openEdit = (note: Note) => {
    setEditId(note._id);
    setTitle(note.title);
    setContent(note.content);
    setShowModal(true);
  };

  const openNew = () => {
    setEditId(null);
    setTitle("");
    setContent("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  if (loading) {
    return <Skeleton />;
  }

  return (
    <main className="p-4 sm:p-8 flex-1">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 text-blue-600 flex items-center justify-center">
              <FileText className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800">Notes</h1>
          </div>
          <p className="text-slate-500 font-medium text-sm">
            Jot down your thoughts and observations
          </p>
        </div>
        <button
          onClick={openNew}
          className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 transition-all flex-shrink-0"
        >
          <Plus className="w-6 h-6" />
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AnimatePresence>
          {notes.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="col-span-full p-8 text-center bg-white rounded-3xl border border-slate-200"
            >
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No notes yet.</p>
            </motion.div>
          )}

          {notes.map((note) => (
            <motion.div
              key={note._id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-white/90 backdrop-blur-sm p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 flex flex-col transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  onClick={() => openEdit(note)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteNote(note._id)}
                  className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-bold text-slate-800 mb-2 pr-16 truncate">{note.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed line-clamp-4 flex-1">
                {note.content}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showModal && (
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
              className="bg-white/80 backdrop-blur-2xl w-full max-w-lg rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-800">{editId ? "Edit Note" : "New Note"}</h2>
                <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-4 flex flex-col gap-4 overflow-y-auto">
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Note Title"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800"
                  />
                  <textarea
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your note here..."
                    className="w-full flex-1 min-h-[200px] px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium resize-none text-slate-700"
                  />
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm flex items-center gap-2 disabled:opacity-70 text-sm transition-colors"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Note"}
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
