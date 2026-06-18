"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Plus, Trash2, ChevronRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ProModal } from "@/components/ProModal";
import { Skeleton } from "@/components/Skeleton";

interface ChatSession {
  _id: string;
  title: string;
  updatedAt: string;
}

const spring = { duration: 0.2 };

export default function ChatHistoryPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProModal, setShowProModal] = useState(false);

  useEffect(() => {
    if (session?.user && !(session.user as any).isPro) {
      setShowProModal(true);
      setLoading(false);
    } else if (session?.user) {
      fetchChats();
    }

    const handleFocus = () => {
      if (document.visibilityState === "visible" && session?.user && (session.user as any).isPro) {
        fetchChats();
      }
    };
    
    document.addEventListener("visibilitychange", handleFocus);
    window.addEventListener("focus", handleFocus);
    
    return () => {
      document.removeEventListener("visibilitychange", handleFocus);
      window.removeEventListener("focus", handleFocus);
    };
  }, [session]);

  const fetchChats = async () => {
    try {
      const res = await fetch("/api/ai/chat", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setChats(data.chats || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createChat = async () => {
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat" })
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/chat/${data.chat._id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteChat = async (id: string) => {
    if (!confirm("Delete this chat?")) return;
    setChats(chats.filter(c => c._id !== id));
    await fetch(`/api/ai/chat/${id}`, { method: "DELETE" });
  };

  if (loading) return <Skeleton />;

  return (
    <main className="p-5 pb-32 flex-1 bg-grid min-h-screen relative">
      <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="sticky top-0 z-[60] pt-5 pb-4 -mx-5 px-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-display text-[26px] text-[#1A1A2E]">AI Chat</h1>
            <p className="text-[13px] font-medium text-black/40 mt-0.5">Your intelligent SIWES assistant</p>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={createChat} className="w-10 h-10 rounded-full bg-[#3B5BDB] text-white flex items-center justify-center shadow-md">
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.header>

      <div className="space-y-3">
        {chats.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-[1.5rem] p-8 text-center mt-4">
            <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-[#3B5BDB]" />
            </div>
            <p className="text-[14px] font-medium text-black/40">No chat history found.</p>
            <p className="text-[12px] text-black/30 mt-1">Tap the plus button to start a new session!</p>
          </motion.div>
        ) : (
          chats.map((chat, i) => (
            <motion.div
              key={chat._id}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, ...spring }}
              className="glass-card rounded-[1.25rem] p-4 flex items-center justify-between group cursor-pointer hover:bg-black/5"
              onClick={() => router.push(`/chat/${chat._id}`)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-full bg-[#3B5BDB]/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-[#3B5BDB]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-bold text-[#1A1A2E] truncate">{chat.title}</h3>
                  <p className="text-[12px] text-black/40 font-medium">
                    {new Date(chat.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); deleteChat(chat._id); }} className="w-8 h-8 rounded-full flex items-center justify-center text-black/20 hover:text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <ChevronRight className="w-5 h-5 text-black/20" />
              </div>
            </motion.div>
          ))
        )}
      </div>

      <ProModal isOpen={showProModal} onClose={() => router.push("/home")} userEmail={(session?.user as any)?.email || ""} />
    </main>
  );
}
