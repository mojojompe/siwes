"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, ArrowLeft, Mic, MicOff, FileText, CalendarPlus, Sparkles } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";

interface Message {
  _id?: string;
  role: "user" | "model";
  content: string;
}

const spring = { duration: 0.2 }; // Keep optimized spring

export default function ChatSessionPage() {
  const router = useRouter();
  const params = useParams();
  const chatId = params?.id as string;
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (session?.user) {
      if (!(session.user as any).isPro) {
        router.push("/chat");
      } else if (chatId) {
        fetchHistory();
      }
    }
  }, [session, chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          setInput((prev) => {
            const base = prev.replace(/ \((listening...)\)$/, "");
            return base + " " + currentTranscript;
          });
        };
        
        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        toast.error("Speech recognition is not supported in this browser.");
      }
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/ai/chat/${chatId}`);
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

  const handleSend = async (textToSend: string, action?: string) => {
    if (!textToSend.trim() || sending) return;

    if (isListening) {
      toggleListening();
    }

    setInput("");
    setSending(true);

    const newMessages: Message[] = [...messages, { role: "user", content: textToSend }];
    setMessages(newMessages);

    try {
      const res = await fetch(`/api/ai/chat/${chatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSend, action })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...newMessages, { role: "model", content: data.response }]);
      } else {
        const errData = await res.json();
        toast.error(`AI Error: ${errData.error || "Unknown error"}\nDetails: ${errData.details || ""}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const exportToNote = async (content: string) => {
    try {
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "AI Note", content })
      });
      toast.success("Exported to Notes!");
    } catch (err) {
      toast.error("Failed to export.");
    }
  };

  const exportToLog = async (content: string) => {
    try {
      await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          date: new Date().toISOString(), 
          description: content,
          dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
          weekNumber: 1
        })
      });
      toast.success("Exported to Logs!");
    } catch (err) {
      toast.error("Failed to export.");
    }
  };

  if (loading) return <main className="flex-1 flex items-center justify-center min-h-screen mesh-bg"><Loader2 className="w-8 h-8 text-[#6CAADE] animate-spin" /></main>;

  return (
    <main className="flex flex-col min-h-[100dvh] bg-grid relative">
      <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="sticky top-0 z-[60] pt-5 pb-4 px-5 glass-card rounded-b-[1.5rem] flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => window.location.href = "/chat"} className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black/40 hover:bg-black/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="heading-display text-[20px] text-[#1A1A2E] leading-none">AI Assistant</h1>
            <p className="text-[12px] font-medium text-black/40 mt-1">Context Aware AI</p>
          </div>
        </div>
      </motion.header>

      <div className="flex-1 overflow-y-auto px-5 py-6 pb-32 space-y-4">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center pt-20">
            <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Bot className="w-10 h-10 text-[#6CAADE]" />
            </div>
            <h2 className="heading-display text-[22px] text-[#1A1A2E] mb-2">How can I help?</h2>
            <p className="text-[14px] text-black/50 font-medium max-w-[260px] mx-auto leading-relaxed mb-6">
              Ask me to brainstorm logbook entries, organize tasks, or explain university concepts.
            </p>

            <button 
              onClick={() => handleSend("Summarize my recent logs", "summarize-logs")}
              className="px-4 py-2 bg-white/60 border border-black/10 rounded-full text-[13px] font-bold text-[#6CAADE] shadow-sm hover:bg-white transition-colors flex items-center gap-2 mx-auto"
            >
              <Sparkles className="w-4 h-4" /> Summarize my recent logs
            </button>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div key={msg._id || i} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={`flex flex-col gap-1 max-w-[85%] ${msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}>
              <div className={`flex gap-3 w-full ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-auto shadow-sm ${msg.role === "user" ? "bg-[#1A1A2E]" : "bg-indigo-100"}`}>
                  {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-[#6CAADE]" />}
                </div>
                <div className={`p-4 rounded-[1.25rem] ${msg.role === "user" ? "bg-[#1A1A2E] text-white rounded-br-sm shadow-md" : "glass-card text-[#1A1A2E] rounded-bl-sm border border-black/5"}`}>
                  <div className={`text-[14px] font-medium leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none ${msg.role === "user" ? "" : "opacity-90 prose-p:my-1 prose-ul:my-1 prose-ol:my-1"}`}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
              
              {msg.role === "model" && (
                <div className="flex gap-2 pl-11 mt-1 opacity-0 hover:opacity-100 transition-opacity" style={{ opacity: 1 }}>
                  <button onClick={() => exportToNote(msg.content)} className="text-[10px] font-bold text-black/40 hover:text-[#6CAADE] flex items-center gap-1 bg-white/50 px-2 py-1 rounded-md border border-black/5">
                    <FileText className="w-3 h-3" /> Export to Note
                  </button>
                  <button onClick={() => exportToLog(msg.content)} className="text-[10px] font-bold text-black/40 hover:text-[#6CAADE] flex items-center gap-1 bg-white/50 px-2 py-1 rounded-md border border-black/5">
                    <CalendarPlus className="w-3 h-3" /> Export to Log
                  </button>
                </div>
              )}
            </motion.div>
          ))}

          {sending && (
             <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="flex gap-3 max-w-[85%] mr-auto">
               <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-auto bg-indigo-100 shadow-sm"><Bot className="w-4 h-4 text-[#6CAADE]" /></div>
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

      <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-[#fafafa] via-[#fafafa]/80 to-transparent pointer-events-none z-50">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="relative max-w-lg mx-auto pointer-events-auto flex gap-2">
          <button 
            type="button" 
            onClick={toggleListening} 
            className={`w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md border border-black/5 transition-colors flex-shrink-0 ${isListening ? "text-red-500" : "text-black/40 hover:text-[#6CAADE]"}`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <div className="relative flex-1">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Message AI..." 
              disabled={sending} 
              className="w-full pl-5 pr-14 h-14 glass-card bg-white/80 rounded-[2rem] text-[15px] font-medium text-[#1A1A2E] placeholder:text-black/30 shadow-md border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#6CAADE]/20" 
            />
            <motion.button whileTap={{ scale: 0.9 }} type="submit" disabled={!input.trim() || sending} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#6CAADE] text-white flex items-center justify-center disabled:opacity-50 transition-colors shadow-sm">
              <Send className="w-4 h-4 ml-0.5" />
            </motion.button>
          </div>
        </form>
      </div>
    </main>
  );
}
