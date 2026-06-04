"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, ArrowLeft, Mic } from "lucide-react";
import { useRouter } from "next/navigation";

interface Message {
  _id?: string;
  role: "user" | "model";
  content: string;
}

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/ai/chat");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await fetch("/api/ai/chat", { method: "DELETE" }); // Optional: Implement DELETE in backend later if needed
      setMessages([]);
    } catch (err) {}
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput("");
    setSending(true);

    // Optimistically add user message
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userMessage })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...newMessages, { role: "model", content: data.response }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-screen mesh-bg">
        <Loader2 className="w-8 h-8 text-[#3B5BDB] animate-spin" />
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen mesh-bg relative">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -12 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={spring} 
        className="sticky top-0 z-[60] pt-5 pb-4 px-5 glass-card rounded-b-[1.5rem] flex items-center justify-between shadow-sm"
      >
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black/40 hover:bg-black/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="heading-display text-[20px] text-[#1A1A2E] leading-none">AI Assistant</h1>
            <p className="text-[12px] font-medium text-black/40 mt-1">Powered by Gemini</p>
          </div>
        </div>
      </motion.header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-5 py-6 pb-32 space-y-4">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center pt-20">
            <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Bot className="w-10 h-10 text-[#3B5BDB]" />
            </div>
            <h2 className="heading-display text-[22px] text-[#1A1A2E] mb-2">How can I help?</h2>
            <p className="text-[14px] text-black/50 font-medium max-w-[260px] mx-auto leading-relaxed">
              Ask me to brainstorm logbook entries, organize tasks, or explain university concepts.
            </p>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={msg._id || i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-auto shadow-sm ${
                msg.role === "user" ? "bg-[#1A1A2E]" : "bg-indigo-100"
              }`}>
                {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-[#3B5BDB]" />}
              </div>
              <div className={`p-4 rounded-[1.25rem] ${
                msg.role === "user" 
                  ? "bg-[#1A1A2E] text-white rounded-br-sm shadow-md shadow-black/10" 
                  : "glass-card text-[#1A1A2E] rounded-bl-sm border border-black/5"
              }`}>
                <p className={`text-[14px] font-medium leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "" : "opacity-90"}`}>
                  {msg.content}
                </p>
              </div>
            </motion.div>
          ))}
          {sending && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="flex gap-3 max-w-[85%] mr-auto"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-auto bg-indigo-100 shadow-sm">
                <Bot className="w-4 h-4 text-[#3B5BDB]" />
              </div>
              <div className="p-4 rounded-[1.25rem] glass-card text-[#1A1A2E] rounded-bl-sm border border-black/5 flex items-center gap-1.5 h-12">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-black/20" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-black/20" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-black/20" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-24 left-0 right-0 p-4 pb-2 pointer-events-none z-50">
        <form onSubmit={handleSend} className="relative max-w-lg mx-auto pointer-events-auto flex gap-2">
          <button
            type="button"
            onClick={() => {
              const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
              if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.onresult = (e: any) => setInput(prev => prev + " " + e.results[0][0].transcript);
                recognition.start();
              } else {
                alert("Speech recognition is not supported in this browser.");
              }
            }}
            className="w-14 h-14 rounded-full bg-white text-black/40 flex items-center justify-center hover:text-[#3B5BDB] shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-black/5 transition-colors flex-shrink-0"
          >
            <Mic className="w-5 h-5" />
          </button>
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message AI..."
              disabled={sending}
              className="w-full pl-5 pr-14 h-14 glass-card bg-white/80 rounded-[2rem] text-[15px] font-medium text-[#1A1A2E] placeholder:text-black/30 shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 transition-shadow disabled:opacity-70"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="submit"
              disabled={!input.trim() || sending}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#3B5BDB] text-white flex items-center justify-center disabled:opacity-50 disabled:bg-black/10 disabled:text-black/30 transition-colors shadow-sm shadow-[#3B5BDB]/20"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </motion.button>
          </div>
        </form>
      </div>

      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 z-[100] bg-white/50 flex items-center justify-center pointer-events-auto">
        <h2 className="text-[32px] font-bold text-black/20 uppercase tracking-widest rotate-[-15deg] select-none">
          Coming Soon
        </h2>
      </div>
    </main>
  );
}
