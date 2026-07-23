"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Bell, BellRing, Check, Info, Calendar, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";
import { Footer } from "@/components/Footer";

interface Notification {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  createdAt: string;
  actionLink?: string;
}

const STATIC_UPDATES: Notification[] = [
  {
    _id: "static-update-ilesure",
    title: "Join the iléSure Waitlist! 🏡",
    message: `Be among the first to experience a smarter way to discover and secure housing.\n\nAs a waitlist member, you'll receive:\n• Early access to the platform\n• Exclusive product updates\n• Priority notifications\n\nTogether, we're building a future where finding a home is simpler, safer, and built on trust.\n\nVisit our Website: https://ilesure.com\nOR\nJoin Now and be a part of that future: https://ilesure.com/discover\n\n*iléSure*\n_Your Sure Home Anywhere_ 🏡`,
    isRead: false,
    type: "alarm",
    actionLink: "https://ilesure.com/discover",
    createdAt: new Date().toISOString()
  },
  {
    _id: "static-update-pro-live",
    title: "SIWES Tracker Pro is Live! 👑",
    message: "Unlock Premium features including Media Uploads, unlimited Context-Aware AI Chat, and the AI log rephraser! Tap Profile to upgrade.",
    isRead: false,
    type: "info",
    actionLink: "/profile",
    createdAt: new Date().toISOString()
  },
  {
    _id: "static-update-v3-1",
    title: "Major Update: v3.0 is here! 🚀",
    message: "We've added Image Uploads, Activity Heatmap, Focus Mode, and Offline Sync! Enjoy the new SIWES Tracker features.",
    isRead: false,
    type: "info",
    createdAt: new Date().toISOString()
  },
  {
    _id: "static-update-v2-tips",
    title: "Tips Page Revamped! 📚",
    message: "We've overhauled the SIWES Tips page with a comprehensive 3-phase guide to help you from commencement to final evaluation.",
    isRead: false,
    type: "info",
    actionLink: "/tips",
    createdAt: new Date().toISOString()
  },
  {
    _id: "static-update-v2-1",
    title: "Welcome to SIWES Tracker v2.0! 🎉",
    message: "We've added massive new features to supercharge your industrial training experience.",
    isRead: false,
    type: "info",
    createdAt: new Date().toISOString()
  },
  {
    _id: "static-update-v2-2",
    title: "AI Log Rephraser ✨",
    message: "When adding a daily log, tap the sparkles icon. Our Gemini AI will rewrite your rough notes into a professional, official-sounding entry!",
    isRead: false,
    type: "info",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // yesterday
  },
  {
    _id: "static-update-v2-3",
    title: "SIWES Guide & Tips 💡",
    message: "Stuck on what to do next? Tap the Lightbulb icon on your home screen to see step-by-step instructions for every phase of SIWES.",
    isRead: false,
    type: "info",
    actionLink: "/tips",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
  },
  {
    _id: "static-update-v2-4",
    title: "Streaks Dashboard 🔥",
    message: "Keep your momentum going! Fill your logbook every day to build your streak. Check out the new flame animation on your Streaks page.",
    isRead: false,
    type: "info",
    actionLink: "/streaks",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() // 3 days ago
  }
];

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        // Check local storage to see which static updates have been read
        const readStaticIds = JSON.parse(localStorage.getItem("readStaticUpdates") || "[]");
        const staticUpdatesWithReadState = STATIC_UPDATES.map(update => ({
          ...update,
          isRead: readStaticIds.includes(update._id)
        }));
        
        // Merge and sort by date descending
        const merged = [...staticUpdatesWithReadState, ...data.notifications].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setNotifications(merged);

        // SYSTEM LEVEL PUSH NOTIFICATION
        const hasPushedIlesure = localStorage.getItem("pushed_ilesure");
        if (!hasPushedIlesure && !readStaticIds.includes("static-update-ilesure")) {
          if ("Notification" in window) {
            const sendPush = () => {
              const notif = new Notification("iléSure Waitlist is Open! 🏡", {
                body: "Experience a smarter way to discover and secure housing. Join now for early access!",
                icon: "/icon.png"
              });
              notif.onclick = () => {
                window.open("https://ilesure.com/discover", "_blank");
              };
              localStorage.setItem("pushed_ilesure", "true");
            };

            if (Notification.permission === "granted") {
              sendPush();
            } else if (Notification.permission !== "denied") {
              Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                  sendPush();
                }
              });
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async (n: Notification) => {
    setSelectedNotif(n);
    if (!n.isRead) {
      // Mark as read in local state instantly
      setNotifications(prev => prev.map(item => item._id === n._id ? { ...item, isRead: true } : item));
      
      if (n._id.startsWith("static-update")) {
        const readStaticIds = JSON.parse(localStorage.getItem("readStaticUpdates") || "[]");
        if (!readStaticIds.includes(n._id)) {
          readStaticIds.push(n._id);
          localStorage.setItem("readStaticUpdates", JSON.stringify(readStaticIds));
        }
      } else {
        // Mark as read in DB
        await fetch("/api/notifications", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "markRead", notificationId: n._id })
        });
      }
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(item => ({ ...item, isRead: true })));
    
    // Mark static updates as read
    const staticIds = STATIC_UPDATES.map(u => u._id);
    localStorage.setItem("readStaticUpdates", JSON.stringify(staticIds));
    
    // Mark DB updates as read
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markAllRead" })
    });
  };

  const handleCompleteAction = async () => {
    if (!selectedNotif?.actionLink) {
      setSelectedNotif(null);
      return;
    }
    // Check if it's an external link
    if (selectedNotif.actionLink.startsWith("http")) {
      window.open(selectedNotif.actionLink, "_blank");
    } else {
      router.push(selectedNotif.actionLink);
    }
    setSelectedNotif(null);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "alarm": return <BellRing className="w-5 h-5 text-amber-500" />;
      case "task": return <Check className="w-5 h-5 text-emerald-500" />;
      case "log": return <Calendar className="w-5 h-5 text-[#6CAADE]" />;
      default: return <Info className="w-5 h-5 text-slate-500" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case "alarm": return "bg-amber-50 border-amber-100";
      case "task": return "bg-emerald-50 border-emerald-100";
      case "log": return "bg-[#6CAADE]/5 border-[#6CAADE]/10";
      default: return "bg-slate-50 border-slate-100";
    }
  };

  if (loading) return <Skeleton />;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <main className="p-5 pb-32 flex-1 mesh-bg min-h-screen relative">
      <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="flex items-center justify-between sticky top-0 z-[60] pt-5 pb-4 -mx-5 px-5 mb-6">
        <div className="flex items-center gap-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-black/50 border border-black/5 hover:text-black transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="heading-display text-[22px] text-[#1A1A2E]">Notifications</h1>
        </div>
        {unreadCount > 0 && (
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleMarkAllRead} className="text-[12px] font-bold text-[#6CAADE] px-3 py-1.5 bg-[#6CAADE]/10 rounded-lg">
            Mark all read
          </motion.button>
        )}
      </motion.header>

      <div className="space-y-3">
        <AnimatePresence>
          {notifications.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-[1.5rem] p-8 text-center mt-10">
              <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-black/20" />
              </div>
              <p className="text-[14px] font-medium text-black/40">You're all caught up!</p>
              <p className="text-[12px] text-black/30 mt-1">No new notifications here.</p>
            </motion.div>
          ) : (
            notifications.map((notif, idx) => (
              <motion.div
                key={notif._id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05, ...spring }}
                onClick={() => handleOpen(notif)}
                className={`glass-card rounded-[1.5rem] p-4 flex gap-4 cursor-pointer relative overflow-hidden group ${notif.isRead ? 'opacity-70' : 'bg-white/80'}`}
              >
                {!notif.isRead && (
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#6CAADE]" />
                )}
                <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center border ${getBg(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 pr-4">
                  <h3 className={`text-[15px] font-bold ${notif.isRead ? 'text-[#1A1A2E]/70' : 'text-[#1A1A2E]'}`}>{notif.title}</h3>
                  <p className="text-[13px] text-black/50 line-clamp-2 mt-0.5 whitespace-pre-wrap">{notif.message}</p>
                  <p className="text-[10px] text-black/30 font-bold uppercase tracking-wider mt-2">
                    {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8">
        <Footer />
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedNotif && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedNotif(null)} className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px]" />
            <motion.div
              initial={{ y: "100%", opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: "100%", opacity: 0, scale: 0.95 }} transition={spring}
              className="fixed top-1/2 left-5 right-5 -translate-y-1/2 z-[101] bg-white rounded-[2rem] p-6 shadow-2xl"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border ${getBg(selectedNotif.type)}`}>
                {getIcon(selectedNotif.type)}
              </div>
              <h2 className="heading-display text-[22px] text-[#1A1A2E] mb-3 leading-tight">{selectedNotif.title}</h2>
              <p className="text-[15px] text-black/60 font-medium leading-relaxed mb-8 whitespace-pre-wrap">
                {selectedNotif.message}
              </p>
              
              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setSelectedNotif(null)}
                  className="flex-1 py-4 bg-black/5 text-[#1A1A2E] text-[15px] font-bold rounded-xl transition-colors">
                  Close
                </motion.button>
                {selectedNotif.actionLink && (
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleCompleteAction}
                    className="flex-[2] py-4 btn-primary rounded-xl font-bold text-[15px]">
                    Complete Action
                  </motion.button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
