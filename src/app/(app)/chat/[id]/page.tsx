"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2, ArrowLeft, Mic, MicOff, FileText, CalendarPlus, Sparkles } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";

interface Message {
  _id?: string;
  role: "user" | "model";
  content: string;
}

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
            // Very simple approach to appending transcribed text
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
        alert("Speech recognition is not supported in this browser.");
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
      }
    } catch (err) {
      console.error(err);
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
      alert("Exported to Notes!");
    } catch (err) {
      alert("Failed to export.");
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
      alert("Exported to Logs!");
    } catch (err) {
      alert("Failed to export.");
    }
  };

  if (loading) return <main className="flex-1 flex items-center justify-center min-h-screen bg-white"><Loader2 className="w-8 h-8 text-[#10a37f] animate-spin" /></main>;

  return (
    <main className="flex flex-col min-h-[100dvh] bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
        <button onClick={() => router.push("/chat")} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">AI Assistant</h1>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto pb-40">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full pt-20 px-4 text-center">
            <div className="w-16 h-16 bg-[#10a37f]/10 rounded-full flex items-center justify-center mb-6">
              <Bot className="w-8 h-8 text-[#10a37f]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">How can I help you today?</h2>
            <p className="text-gray-500 mb-8 max-w-sm">
              I can help you brainstorm logbook entries, organize tasks, or explain university concepts.
            </p>
            <button 
              onClick={() => handleSend("Summarize my recent logs", "summarize-logs")}
              className="px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#10a37f]" /> Summarize my recent logs
            </button>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={msg._id || i} className={`w-full py-6 px-4 ${msg.role === "model" ? "bg-gray-50 border-y border-gray-100" : "bg-white"}`}>
            <div className="max-w-3xl mx-auto flex gap-4 md:gap-6">
              <div className="w-8 h-8 rounded-sm flex-shrink-0 flex items-center justify-center mt-1">
                {msg.role === "user" ? (
                  <div className="w-8 h-8 rounded-sm bg-gray-800 flex items-center justify-center"><User className="w-5 h-5 text-white" /></div>
                ) : (
                  <div className="w-8 h-8 rounded-sm bg-[#10a37f] flex items-center justify-center"><Bot className="w-5 h-5 text-white" /></div>
                )}
              </div>
              <div className="flex-1 space-y-2 overflow-hidden">
                <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                {msg.role === "model" && (
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => exportToNote(msg.content)} className="text-xs font-medium text-gray-500 hover:text-gray-800 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Note
                    </button>
                    <button onClick={() => exportToLog(msg.content)} className="text-xs font-medium text-gray-500 hover:text-gray-800 flex items-center gap-1">
                      <CalendarPlus className="w-3 h-3" /> Log
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {sending && (
          <div className="w-full py-6 px-4 bg-gray-50 border-y border-gray-100">
            <div className="max-w-3xl mx-auto flex gap-4 md:gap-6">
              <div className="w-8 h-8 rounded-sm bg-[#10a37f] flex-shrink-0 flex items-center justify-center mt-1">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 flex items-center">
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-10" />
      </div>

      {/* Input Form */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/90 to-transparent">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="max-w-3xl mx-auto relative flex items-end gap-2 bg-white border border-gray-300 rounded-2xl shadow-sm focus-within:ring-1 focus-within:ring-gray-300 overflow-hidden pr-2">
          <textarea 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Message AI Assistant..." 
            disabled={sending}
            rows={1}
            className="w-full max-h-32 min-h-[56px] py-4 pl-4 bg-transparent text-[15px] text-gray-800 placeholder:text-gray-400 resize-none focus:outline-none disabled:opacity-50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(input);
              }
            }}
          />
          <div className="flex items-center gap-1 pb-2">
            <button 
              type="button" 
              onClick={toggleListening} 
              className={`p-2 rounded-lg transition-colors ${isListening ? "text-red-500 bg-red-50 hover:bg-red-100" : "text-gray-400 hover:bg-gray-100"}`}
              title={isListening ? "Stop listening" : "Start Voice to Text"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button 
              type="submit" 
              disabled={!input.trim() || sending} 
              className="p-2 bg-[#10a37f] text-white rounded-lg disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400 hover:bg-[#0e906f] transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
        <p className="text-center text-xs text-gray-400 mt-2">AI can make mistakes. Consider verifying important information.</p>
      </div>
    </main>
  );
}
