"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { FileText, Plus, Search, Calendar, ChevronDown, CheckCircle2, Circle, Lightbulb, Bell, Mic, Loader2, Sparkles, Image as ImageIcon, X, Tag, Trash2, Edit3, Crown, CheckSquare } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";
import { useRouter } from "next/navigation";
import { ProModal } from "@/components/ProModal";
import { EmailModal } from "@/components/EmailModal";
import { RiveEmptyState } from "@/components/RiveEmptyState";

interface Log { _id: string; date: string; description: string; dayOfWeek: string; weekNumber: number; tags?: string[]; reminder?: string; mediaUrls?: string[]; }
interface Todo { _id: string; title: string; completed: boolean; date: string; }
interface Note { _id: string; title: string; content: string; }

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [logs, setLogs] = useState<Log[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [reminder, setReminder] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [showAiTooltip, setShowAiTooltip] = useState(false);
  const [showTipsPointer, setShowTipsPointer] = useState(false);
  const [showNotifPointer, setShowNotifPointer] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => { 
    fetchAllData(); 
    
    // Check if email is missing and prompt
    if (session?.user && !(session.user as any).email) {
      setShowEmailModal(true);
    }
    
    // Sequential pointers
    setShowTipsPointer(true);
    const t1 = setTimeout(() => {
      setShowTipsPointer(false);
      setShowNotifPointer(true);
    }, 3500);
    const t2 = setTimeout(() => {
      setShowNotifPointer(false);
    }, 7000);
    
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const fetchAllData = async () => {
    try {
      const [resLogs, resTodos, resNotes, resNotifs] = await Promise.all([
        fetch("/api/logs"), fetch("/api/todos"), fetch("/api/notes"), fetch("/api/notifications")
      ]);
      if (resLogs.ok) { const data = await resLogs.json(); setLogs(data.logs); }
      if (resTodos.ok) { const data = await resTodos.json(); setTodos(data.todos); }
      if (resNotes.ok) { const data = await resNotes.json(); setNotes(data.notes); }
      if (resNotifs.ok) {
        const data = await resNotifs.json();
        const dbUnread = data.notifications.filter((n: any) => !n.isRead).length;
        const readStaticIds = JSON.parse(localStorage.getItem("readStaticUpdates") || "[]");
        const staticUnread = Math.max(0, 7 - readStaticIds.length);
        setUnreadCount(dbUnread + staticUnread);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!date || !description.trim()) return;
    
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
      mediaUrls,
    };

    try {
      const url = editId ? `/api/logs/${editId}` : "/api/logs";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save log");
      
      if ("vibrate" in navigator) navigator.vibrate(50);

      // Check if this log completed a 5-day week
      if (!editId) {
        const weekNum = data.log?.weekNumber;
        if (weekNum) {
          const logsInWeek = logs.filter(l => l.weekNumber === weekNum).length + 1; // +1 for the new log
          if (logsInWeek === 5) {
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, zIndex: 200 });
          }
        }
      }

      closeSheet(); fetchAllData();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  const deleteLog = async (id: string) => {
    setLogs(logs.filter(l => l._id !== id));
    try { await fetch(`/api/logs/${id}`, { method: "DELETE" }); } catch { fetchAllData(); }
  };

  const openNew = () => {
    setEditId(null); setDate(new Date().toISOString().split("T")[0]);
    setDescription(""); setTagsStr(""); setReminder(""); setMediaUrls([]);
    setShowAdd(true);
    setShowAiTooltip(true);
    setTimeout(() => setShowAiTooltip(false), 3000);
  };
  
  const openEdit = (log: Log) => {
    setEditId(log._id);
    setDate(new Date(log.date).toISOString().split("T")[0]);
    setDescription(log.description);
    setTagsStr(log.tags?.join(", ") || "");
    setReminder(log.reminder ? new Date(log.reminder).toTimeString().slice(0,5) : "");
    setMediaUrls(log.mediaUrls || []);
    setShowAdd(true);
    setShowAiTooltip(true);
    setTimeout(() => setShowAiTooltip(false), 3000);
  };

  const closeSheet = () => { setShowAdd(false); };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "siwes_tracker");

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dg3xx14ui/image/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setMediaUrls(prev => [...prev, data.secure_url]);
      } else {
        alert("Upload failed. Check Cloudinary settings.");
      }
    } catch (err) {
      console.error("Upload failed", err);
      alert("Network error during upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Filter Data
  const query = searchQuery.toLowerCase().trim();
  const filteredLogs = logs.filter(l => l.description.toLowerCase().includes(query) || l.tags?.some(t => t.toLowerCase().includes(query)));
  const filteredTodos = todos.filter(t => t.title.toLowerCase().includes(query));
  const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(query) || n.content.toLowerCase().includes(query));

  if (loading || !session) return <Skeleton />;
  const user = session.user as any;
  const isPro = user?.isPro === true;

  // Group logs by week for normal view
  const groupedLogs = logs.reduce((acc, log) => {
    if (!acc[log.weekNumber]) acc[log.weekNumber] = [];
    acc[log.weekNumber].push(log);
    return acc;
  }, {} as Record<number, Log[]>);
  const sortedWeeks = Object.keys(groupedLogs).map(Number).sort((a, b) => b - a);

  return (
    <main className="p-5 pb-32 flex-1 bg-[#fafafa] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] min-h-screen">
      <div className="sticky top-0 z-[60] pt-5 pb-4 -mx-5 px-5 mb-6">
        <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="heading-display text-[26px] text-[#1A1A2E]">Logs</h1>
              {isPro ? (
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1"><Crown className="w-3 h-3" /> PRO</span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-black/5 text-black/40 text-[10px] font-bold uppercase tracking-wider">Free</span>
              )}
            </div>
            <p className="text-[13px] font-medium text-black/40 mt-0.5">Welcome back, {user.firstName}</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.push("/tips")} className="w-11 h-11 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#3B5BDB] border border-[#3B5BDB]/20 hover:bg-[#3B5BDB]/5 transition-colors">
                <Lightbulb className="w-5 h-5 fill-[#3B5BDB]/20" />
              </motion.button>
              <AnimatePresence>
                {showTipsPointer && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-50">
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-600 rotate-45" />
                    Check the Guide!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="relative">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.push("/notifications")} className="w-11 h-11 rounded-2xl bg-white shadow-sm flex items-center justify-center text-amber-500 border border-amber-500/20 hover:bg-amber-50 transition-colors relative">
                <Bell className="w-5 h-5 fill-amber-500/20" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm border-2 border-[#fafafa]">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </motion.button>
              <AnimatePresence>
                {showNotifPointer && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute -bottom-12 right-0 bg-amber-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-50">
                    <div className="absolute -top-1 right-4 w-2 h-2 bg-amber-500 rotate-45" />
                    New updates!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.header>

        {/* Global Search Bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ...spring }}>
          <div className="relative glass-card rounded-[1.5rem] shadow-sm">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
            <input 
              type="text" 
              placeholder="Search logs, tasks, notes..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setIsSearching(e.target.value.trim().length > 0); }}
              className="w-full pl-12 pr-4 py-4 bg-transparent text-[14px] font-bold text-[#1A1A2E] placeholder:text-black/30 placeholder:font-medium focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(""); setIsSearching(false); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      </div>

      <div className="space-y-6 relative z-10">
        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              {filteredLogs.length > 0 && (
                <section>
                  <h3 className="text-[13px] font-bold text-black/40 uppercase tracking-widest mb-3 px-2">Logs ({filteredLogs.length})</h3>
                  <div className="space-y-3">
                    {filteredLogs.map(log => (
                      <div key={log._id} onClick={() => openEdit(log)} className="glass-card rounded-[1.25rem] p-4 cursor-pointer hover:bg-black/5">
                        <div className="flex gap-3"><Calendar className="w-4 h-4 text-[#3B5BDB] flex-shrink-0 mt-0.5" />
                        <div><p className="text-[13px] text-[#1A1A2E] font-medium leading-relaxed line-clamp-2">{log.description}</p></div></div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {filteredTodos.length > 0 && (
                <section>
                  <h3 className="text-[13px] font-bold text-black/40 uppercase tracking-widest mb-3 px-2">Tasks ({filteredTodos.length})</h3>
                  <div className="space-y-3">
                    {filteredTodos.map(todo => (
                      <div key={todo._id} onClick={() => router.push("/todos")} className="glass-card rounded-[1.25rem] p-4 cursor-pointer hover:bg-black/5">
                        <div className="flex gap-3"><CheckSquare className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className={`text-[13px] font-medium ${todo.completed ? 'line-through text-black/30' : 'text-[#1A1A2E]'}`}>{todo.title}</span></div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {filteredNotes.length > 0 && (
                <section>
                  <h3 className="text-[13px] font-bold text-black/40 uppercase tracking-widest mb-3 px-2">Notes ({filteredNotes.length})</h3>
                  <div className="space-y-3">
                    {filteredNotes.map(note => (
                      <div key={note._id} onClick={() => router.push("/notes")} className="glass-card rounded-[1.25rem] p-4 cursor-pointer hover:bg-black/5">
                        <div className="flex gap-3"><FileText className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                        <div><h4 className="text-[14px] font-bold text-[#1A1A2E] mb-1">{note.title}</h4>
                        <p className="text-[12px] text-black/50 line-clamp-1">{note.content}</p></div></div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {filteredLogs.length === 0 && filteredTodos.length === 0 && filteredNotes.length === 0 && (
                <div className="text-center py-10"><p className="text-[14px] font-medium text-black/40">No results found.</p></div>
              )}
            </motion.div>
          ) : (
            <motion.div key="normal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {sortedWeeks.length === 0 ? (
                <div className="glass-card rounded-[1.5rem] p-8 text-center mt-4">
                  <img src="/animations/clay_logs.png" alt="No Logs" className="w-32 h-32 object-contain mx-auto mb-2 opacity-80 mix-blend-multiply" />
                  <p className="text-[14px] font-medium text-black/40">No logs for this week yet.</p>
                  <p className="text-[12px] text-black/30 mt-1">Tap the button below to add your first entry.</p>
                </div>
              ) : (
                sortedWeeks.map((week, idx) => (
                  <motion.section key={week} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1, ...spring }} className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-px flex-1 bg-black/5" />
                      <span className="text-[11px] font-bold text-black/30 uppercase tracking-widest px-2">Week {week}</span>
                      <div className="h-px flex-1 bg-black/5" />
                    </div>
                    {groupedLogs[week].map((log, i) => (
                      <motion.div key={log._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05, ...spring }} onClick={() => openEdit(log)} className="glass-card rounded-[1.5rem] p-5 relative overflow-hidden group cursor-pointer hover:bg-black/5 transition-colors">
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); openEdit(log); }} className="p-1.5 bg-white/70 backdrop-blur-sm text-black/40 hover:text-[#3B5BDB] rounded-lg transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-[#3B5BDB]/8 flex items-center justify-center border border-[#3B5BDB]/10"><Calendar className="w-4 h-4 text-[#3B5BDB]" /></div>
                          <div><h3 className="text-[15px] font-700 text-[#1A1A2E] leading-tight">{log.dayOfWeek}</h3><p className="mono text-[10px] text-black/40 font-bold mt-0.5">{new Date(log.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p></div>
                        </div>
                        <p className="text-[13px] text-black/50 leading-relaxed font-medium line-clamp-3 pl-1">{log.description}</p>
                        {(log.tags && log.tags.length > 0 || log.reminder) && (
                          <div className="mt-4 pt-3 border-t border-black/5 flex flex-wrap gap-2 items-center">
                            {log.reminder && (
                              <span className="inline-flex items-center gap-1 text-[10px] mono px-2 py-1 bg-amber-50 text-amber-600 rounded border border-amber-100"><Bell className="w-2.5 h-2.5" />{new Date(log.reminder).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                            )}
                            {log.tags?.map(t => (
                              <span key={t} className="inline-flex items-center gap-1 text-[10px] mono px-2 py-1 bg-black/5 text-black/50 rounded"><Tag className="w-2.5 h-2.5" /> {t}</span>
                            ))}
                          </div>
                        )}
                        {log.mediaUrls && log.mediaUrls.length > 0 && (
                          <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                            {log.mediaUrls.map((url, i) => (
                              <img key={i} src={url} alt="Log attachment" className="w-14 h-14 rounded-lg object-cover border border-black/5 flex-shrink-0" />
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </motion.section>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button whileTap={{ scale: 0.93 }} transition={spring} onClick={openNew} className="fixed bottom-24 right-5 z-30 w-14 h-14 rounded-full bg-[#3B5BDB] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(59,91,219,0.4)] hover:bg-[#3451C9] transition-colors">
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </motion.button>

      {/* Add / Edit Sheet */}
      <AnimatePresence>
        {showAdd && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeSheet} className="fixed inset-0 z-[90] bg-black/30 backdrop-blur-[2px]" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={spring} className="fixed bottom-0 left-0 right-0 z-[100] glass-card rounded-t-[2rem] p-6 pb-28 flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between mb-5 flex-shrink-0">
                <h3 className="heading-display text-[18px]">{editId ? "Edit Log Entry" : "Add Log Entry"}</h3>
                <motion.button whileTap={{ scale: 0.85 }} onClick={closeSheet} className="w-8 h-8 rounded-full bg-black/6 flex items-center justify-center text-black/40"><X className="w-4 h-4" /></motion.button>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0">
                <form id="logForm" onSubmit={handleSave} className="space-y-4">
                  {error && <div className="p-3 bg-red-50 text-red-600 text-[12px] font-bold rounded-xl border border-red-100">{error}</div>}
                  <div>
                    <label className="block text-[11px] font-bold text-black/40 uppercase tracking-wider mb-1.5 ml-1">Date</label>
                    <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3.5 input-premium text-[14px] font-medium" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5 ml-1 pr-1">
                      <label className="block text-[11px] font-bold text-black/40 uppercase tracking-wider">Daily Log</label>
                      <div className="flex items-center gap-4">
                        {/* Voice Input Button */}
                        <button type="button" onClick={() => {
                          if (isListening) {
                            recognitionRef.current?.stop();
                            setIsListening(false);
                          } else {
                            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                            if (SpeechRecognition) {
                              const recognition = new SpeechRecognition();
                              recognitionRef.current = recognition;
                              recognition.onresult = (e: any) => setDescription(prev => prev + " " + e.results[0][0].transcript);
                              recognition.onend = () => setIsListening(false);
                              recognition.start();
                              setIsListening(true);
                            } else {
                              alert("Speech recognition is not supported in this browser.");
                            }
                          }
                        }} className={`transition-colors flex items-center gap-1.5 px-2 py-1 rounded-lg ${isListening ? "bg-red-50 text-red-500 animate-pulse" : "bg-black/5 text-black/40 hover:text-[#3B5BDB]"}`}>
                          {isListening ? (
                            <><div className="w-2.5 h-2.5 bg-red-500 rounded-sm" /><span className="text-[10px] font-bold tracking-wider">REC</span></>
                          ) : (
                            <Mic className="w-4 h-4" />
                          )}
                        </button>
                        
                        {/* AI Rephrase Button */}
                        <div className="relative">
                          <button type="button" onClick={async () => {
                            if (!isPro) {
                              setShowProModal(true);
                              return;
                            }
                            if (!description.trim()) return;
                            setSaving(true);
                            try {
                              const res = await fetch("/api/ai/rephrase", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: description }) });
                              const data = await res.json();
                              if (data.rephrased) setDescription(data.rephrased);
                            } catch (err) {} finally { setSaving(false); }
                          }} className={`${isPro ? "text-amber-500/60 hover:text-amber-500" : "text-amber-500/40 hover:text-amber-500/60"} transition-colors flex items-center gap-1`}>
                            <Sparkles className="w-5 h-5" />
                          </button>
                          
                          <AnimatePresence>
                            {showAiTooltip && (
                              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="absolute top-full right-0 mt-3 bg-indigo-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-50">
                                You can rephrase with AI now!
                                <div className="absolute -top-1 right-2 w-2 h-2 bg-indigo-600 rotate-45" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        
                        {/* Image Upload Button */}
                        <div className="relative flex items-center">
                          <button type="button" onClick={() => {
                            if (!isPro) {
                              setShowProModal(true);
                              return;
                            }
                            fileInputRef.current?.click();
                          }} className={`text-black/40 hover:text-emerald-500 transition-colors flex items-center justify-center p-1.5 rounded-lg hover:bg-emerald-50 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                          </button>
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </div>
                      </div>
                    </div>
                    <textarea required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What did you learn or do today?" className="w-full px-4 py-3.5 input-premium text-[14px] font-medium min-h-[120px] resize-none leading-relaxed" />
                    
                    {/* Media Upload Previews */}
                    {mediaUrls.length > 0 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
                        {mediaUrls.map((url, i) => (
                          <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-black/5">
                            <img src={url} alt="Upload preview" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => setMediaUrls(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-4 h-4 bg-black/50 hover:bg-red-500 transition-colors rounded-full text-white flex items-center justify-center">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {uploading && (
                          <div className="w-16 h-16 rounded-xl bg-black/5 flex items-center justify-center flex-shrink-0 border border-black/5">
                            <Loader2 className="w-5 h-5 text-black/30 animate-spin" />
                          </div>
                        )}
                      </div>
                    )}
                    {uploading && mediaUrls.length === 0 && (
                      <div className="mt-3 flex items-center gap-2 text-[12px] font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                        <Loader2 className="w-3 h-3 animate-spin" /> Uploading image to Cloudinary...
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-black/40 uppercase tracking-wider mb-1.5 ml-1">Tags</label>
                      <div className="relative">
                        <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black/30" />
                        <input type="text" value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="e.g. coding" className="w-full pl-10 pr-4 py-3.5 input-premium text-[13px] font-medium" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-black/40 uppercase tracking-wider mb-1.5 ml-1">Reminder</label>
                      <div className="relative">
                        <Bell className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black/30" />
                        <input type="datetime-local" value={reminder} onChange={(e) => setReminder(e.target.value)} className="w-full pl-10 pr-4 py-3.5 input-premium text-[12px] font-medium mono" />
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="mt-5 flex gap-3 flex-shrink-0">
                {editId && (
                  <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => { deleteLog(editId); closeSheet(); }} className="py-4 px-5 bg-red-50 text-red-600 rounded-xl font-bold flex items-center justify-center"><Trash2 className="w-5 h-5" /></motion.button>
                )}
                <motion.button form="logForm" type="submit" disabled={saving} whileTap={{ scale: 0.97 }} className="flex-1 py-4 btn-primary rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Entry"}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ProModal 
        isOpen={showProModal} 
        onClose={() => setShowProModal(false)} 
        userEmail={(session?.user as any)?.email || ""} 
      />

      <EmailModal 
        isOpen={showEmailModal} 
        onSuccess={() => setShowEmailModal(false)} 
      />
    </main>
  );
}
