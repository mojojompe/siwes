"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, X, Edit3, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";
import { RiveEmptyState } from "@/components/RiveEmptyState";

interface Note { _id: string; title: string; content: string; updatedAt: string; }

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

const NOTE_ACCENTS = [
  "border-blue-400/60",
  "border-violet-400/60",
  "border-emerald-400/60",
  "border-amber-400/60",
  "border-rose-400/60",
  "border-cyan-400/60",
];

function getNoteAccent(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  return NOTE_ACCENTS[Math.abs(hash) % NOTE_ACCENTS.length];
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [viewMode, setViewMode] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => { fetchNotes(); }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/notes");
      if (res.ok) { const data = await res.json(); setNotes(data.notes); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        await fetch(`/api/notes/${editId}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content }),
        });
      } else {
        await fetch("/api/notes", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content }),
        });
      }
      closeModal(); fetchNotes();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const deleteNote = async (id: string) => {
    setNotes(notes.filter(n => n._id !== id));
    try { await fetch(`/api/notes/${id}`, { method: "DELETE" }); }
    catch { fetchNotes(); }
  };

  const openEdit = (note: Note) => { setEditId(note._id); setTitle(note.title); setContent(note.content); setViewMode(true); setShowModal(true); };
  const openNew = () => { setEditId(null); setTitle(""); setContent(""); setViewMode(false); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setDeleteConfirmId(null); };

  if (loading) return <Skeleton />;

  return (
    <main className="p-5 pb-32 flex-1 bg-[#fafafa] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] min-h-screen">
      {/* Header */}
      <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="sticky top-0 z-[60] pt-5 pb-4 -mx-5 px-5 mb-6">
        <h1 className="heading-display text-[26px] text-[#1A1A2E]">Notes</h1>
        <p className="text-[13px] font-medium text-black/40 mt-0.5">Jot down quick thoughts</p>
      </motion.header>

      {/* Notes Grid - Masonry via CSS columns */}
      {notes.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-[1.5rem] p-8 text-center">
          <img src="/animations/clay_notes.png" alt="No Notes" className="w-32 h-32 object-contain mx-auto mb-2 opacity-80 mix-blend-multiply" />
          <p className="text-[14px] font-medium text-black/40">No notes yet. Create your first one!</p>
        </motion.div>
      ) : (
        <div style={{ columnCount: 2, columnGap: "12px" }}>
          <AnimatePresence>
            {notes.map((note, i) => {
              const accent = getNoteAccent(note.title);
              return (
                <motion.div
                  key={note._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.04, ...spring }}
                  style={{ breakInside: "avoid", marginBottom: "12px", display: "block" }}
                  onClick={() => openEdit(note)}
                  className={`glass-card rounded-[1.25rem] p-4 border-t-[3px] ${accent} group relative overflow-hidden cursor-pointer hover:bg-black/5 transition-colors`}
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <motion.button whileTap={{ scale: 0.8 }} onClick={(e) => { e.stopPropagation(); openEdit(note); }}
                      className="p-1.5 bg-white/70 backdrop-blur-sm text-black/40 hover:text-[#6CAADE] rounded-lg transition-colors">
                      <Edit3 className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.8 }} onClick={(e) => { e.stopPropagation(); deleteNote(note._id); }}
                      className="p-1.5 bg-white/70 backdrop-blur-sm text-black/40 hover:text-red-500 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                  <h3 className="text-[13px] font-700 text-[#1A1A2E] pr-10 mb-1.5 line-clamp-2">{note.title}</h3>
                  <p className="text-[12px] text-black/50 leading-relaxed line-clamp-5">{note.content}</p>
                  <p className="mono text-[10px] text-black/30 mt-3 pt-2 border-t border-black/5">
                    {new Date(note.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* FAB */}
      <motion.button whileTap={{ scale: 0.93 }} transition={spring} onClick={openNew}
        className="fixed bottom-24 right-5 z-30 w-14 h-14 rounded-full bg-[#6CAADE] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(108,170,222,0.4)] hover:bg-[#4A8CC0] transition-colors">
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </motion.button>

      {/* Note Modal - slide up */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal} className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[3px]" />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={spring}
              className="fixed inset-x-0 bottom-0 z-50 glass-card rounded-t-[2rem] flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-5 border-b border-black/5 flex-shrink-0">
                <h3 className="heading-display text-[18px]">
                  {viewMode ? "Note" : editId ? "Edit Note" : "New Note"}
                </h3>
                <div className="flex gap-2">
                  {viewMode && (
                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => setViewMode(false)}
                      className="w-8 h-8 rounded-full bg-[#6CAADE]/10 flex items-center justify-center text-[#6CAADE]">
                      <Edit3 className="w-4 h-4" />
                    </motion.button>
                  )}
                  <motion.button whileTap={{ scale: 0.85 }} onClick={closeModal}
                    className="w-8 h-8 rounded-full bg-black/6 flex items-center justify-center text-black/40">
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
              
              {viewMode ? (
                <div className="p-5 flex flex-col gap-4 overflow-y-auto flex-1 h-[80vh] pb-28">
                  <h2 className="text-[20px] font-bold text-[#1A1A2E] leading-tight">{title}</h2>
                  <p className="text-[15px] font-medium text-black/60 leading-relaxed whitespace-pre-wrap">{content}</p>
                </div>
              ) : (
                <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden h-[80vh]">
                  <div className="p-5 flex flex-col gap-4 overflow-y-auto flex-1">
                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                      placeholder="Note title..."
                      className="w-full px-4 py-3.5 input-premium text-[15px] font-700" />
                    <textarea required value={content} onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your thoughts..."
                      className="w-full flex-1 min-h-[200px] px-4 py-3.5 input-premium text-[14px] font-medium resize-none leading-relaxed" />
                  </div>
                  <div className="p-5 pb-28 border-t border-black/5 flex-shrink-0 flex gap-3">
                    {editId && (
                      <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => setDeleteConfirmId(editId)}
                        className="py-4 px-5 bg-red-50 text-red-600 rounded-xl font-bold flex items-center justify-center">
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    )}
                    <motion.button type="submit" disabled={saving} whileTap={{ scale: 0.97 }}
                      className="flex-1 py-4 btn-primary rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 disabled:opacity-60">
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Note"}
                    </motion.button>
                  </div>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Drawer */}
      <AnimatePresence>
        {deleteConfirmId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirmId(null)} className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-[3px]" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={spring} className="fixed bottom-0 left-0 right-0 z-[120] bg-white rounded-t-[2rem] p-6 pb-28 shadow-[0_-24px_80px_rgba(0,0,0,0.15)]">
              <div className="flex flex-col items-center text-center pt-2">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5 relative">
                  <div className="absolute inset-0 rounded-full border border-red-200 animate-ping opacity-20" />
                  <Trash2 className="w-7 h-7 text-red-500 relative z-10" />
                </div>
                <h3 className="heading-display text-[22px] text-[#1A1A2E] mb-2">Delete Note</h3>
                <p className="text-[14px] text-black/50 font-medium mb-8 leading-relaxed max-w-[260px]">
                  Are you sure you want to delete this note? This action cannot be undone.
                </p>
                <div className="flex gap-3 w-full">
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setDeleteConfirmId(null)} className="flex-1 py-4 bg-black/5 hover:bg-black/10 rounded-xl font-bold text-[15px] text-[#1A1A2E] transition-colors">Cancel</motion.button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => { deleteNote(deleteConfirmId); setDeleteConfirmId(null); closeModal(); }} className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-[15px] transition-colors shadow-md shadow-red-500/20">Delete</motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
