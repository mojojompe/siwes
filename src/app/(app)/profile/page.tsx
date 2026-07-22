"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Settings, Bell, Shield, Hash, BookOpen, ChevronRight, LogOut, X, Info, FileText, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showLogout, setShowLogout] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/notifications").then(res => {
      if (res.ok) {
        res.json().then(data => {
          const dbUnread = data.notifications.filter((n: any) => !n.isRead).length;
          const readStaticIds = JSON.parse(localStorage.getItem("readStaticUpdates") || "[]");
          const staticUnread = Math.max(0, 7 - readStaticIds.length);
          setUnreadCount(dbUnread + staticUnread);
        });
      }
    });
  }, []);

  const handleLogout = () => signOut({ callbackUrl: "/login" });

  if (!session?.user) return null;
  const user = session.user as any;

  const infoItems = [
    { icon: Hash, label: "Matric Number", value: user.matricNumber, color: "text-[#6CAADE]", bg: "bg-[#6CAADE]/8" },
    { icon: BookOpen, label: "Department", value: user.department, color: "text-violet-500", bg: "bg-violet-500/8" },
  ];

  const settingsItems = [
    { icon: Settings, label: "Account Settings", color: "text-slate-500", bg: "bg-slate-100", route: "/profile/settings" },
    { icon: Bell, label: "Notifications", color: "text-amber-500", bg: "bg-amber-50", route: "/notifications" },
    { icon: Shield, label: "Privacy & Security", color: "text-emerald-500", bg: "bg-emerald-50", route: "/profile/privacy" },
    { icon: FileText, label: "Logbook Disclaimer", color: "text-indigo-500", bg: "bg-indigo-50", route: "/disclaimer" },
  ];

  return (
    <main className="p-5 pb-32 flex-1 bg-[#fafafa] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] min-h-screen relative">
      {/* Header */}
      <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="sticky top-0 z-[60] pt-5 pb-4 -mx-5 px-5 mb-8 flex items-center justify-between">
        <h1 className="heading-display text-[26px] text-[#1A1A2E]">Profile</h1>
        {user.isPro ? (
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5"><Crown className="w-3.5 h-3.5" /> SIWES PRO</span>
        ) : (
          <span className="px-3 py-1 rounded-full bg-black/5 text-black/40 text-[11px] font-bold uppercase tracking-wider">Free Plan</span>
        )}
      </motion.header>

      <div className="space-y-4">
        {/* Avatar Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05, ...spring }}
          className="glass-card rounded-[1.75rem] p-6 flex flex-col items-center text-center relative z-10"
        >
          {/* Halo ring + clay avatar */}
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#6CAADE]/25 halo-ring" style={{ margin: "-8px" }} />
            <div className="w-24 h-24 rounded-full overflow-hidden shadow-[0_8px_32px_rgba(108,170,222,0.2)] border-2 border-white bg-white">
              <img src="/clay-profile.png" alt="Profile" className="w-full h-full object-cover mix-blend-multiply" />
            </div>
          </div>

          <h2 className="heading-display text-[22px] text-[#1A1A2E] mt-1">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-[13px] text-black/40 font-medium mt-0.5">{user.department}</p>
          <span className="mt-3 px-3 py-1.5 bg-[#6CAADE]/8 text-[#6CAADE] rounded-full text-[11px] font-bold mono border border-[#6CAADE]/12">
            {user.matricNumber}
          </span>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ...spring }}
          className="glass-card rounded-[1.5rem] overflow-hidden relative z-10"
        >
          {infoItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className={`flex items-center justify-between p-4 ${i < infoItems.length - 1 ? "border-b border-black/5" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${item.bg} ${item.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[14px] font-600 text-[#1A1A2E]">{item.label}</span>
                </div>
                <span className="mono text-[12px] font-bold text-black/50 max-w-[120px] truncate text-right">{item.value}</span>
              </div>
            );
          })}
        </motion.div>

        {/* Settings Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, ...spring }}
          className="glass-card rounded-[1.5rem] overflow-hidden relative z-10"
        >
          {settingsItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label} whileTap={{ scale: 0.99 }}
                onClick={() => {
                  if (item.route) router.push(item.route);
                  else setShowComingSoon(true);
                }}
                className={`w-full flex items-center justify-between p-4 hover:bg-black/3 transition-colors ${
                  i < settingsItems.length - 1 ? "border-b border-black/5" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${item.bg} ${item.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[14px] font-600 text-[#1A1A2E]">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.label === "Notifications" && unreadCount > 0 && (
                    <span className="flex h-5 items-center justify-center rounded-full bg-red-500 px-2 text-[10px] font-bold text-white shadow-sm">
                      {unreadCount} New
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-black/25" />
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ...spring }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowLogout(true)}
          className="w-full py-4 glass-card rounded-[1.5rem] text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-50/50 transition-colors border-red-100/50 relative z-10"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </motion.button>
      </div>

      {/* Coming Soon Drawer */}
      <AnimatePresence>
        {showComingSoon && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowComingSoon(false)} className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={spring}
              className="fixed bottom-0 left-0 right-0 z-50 glass-card rounded-t-[2rem] p-6 pb-28 shadow-[0_-20px_60px_rgba(0,0,0,0.1)]"
            >
              <div className="flex flex-col items-center text-center pt-2">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-5 shadow-inner">
                  <Info className="w-7 h-7 text-[#6CAADE]" />
                </div>
                <h3 className="heading-display text-[22px] text-[#1A1A2E] mb-2">Coming Soon</h3>
                <p className="text-[14px] text-black/50 font-medium mb-8 leading-relaxed max-w-[260px]">
                  We are working hard to bring this feature to you in the next update.
                </p>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowComingSoon(false)}
                  className="w-full py-4 btn-primary rounded-xl font-bold text-[15px]">
                  Got it, thanks!
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Redesigned Logout Drawer */}
      <AnimatePresence>
        {showLogout && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowLogout(false)} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[3px]" />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={spring}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[2rem] p-6 pb-28 shadow-[0_-24px_80px_rgba(0,0,0,0.15)]"
            >
              <div className="flex flex-col items-center text-center pt-2">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5 relative">
                  <div className="absolute inset-0 rounded-full border border-red-200 animate-ping opacity-20" />
                  <LogOut className="w-7 h-7 text-red-500 ml-1" />
                </div>
                <h2 className="heading-display text-[22px] text-[#1A1A2E] mb-2">Sign Out?</h2>
                <p className="text-[14px] text-black/50 font-medium mb-8 leading-relaxed px-4">
                  Are you sure you want to sign out of your SIWES tracker account?
                </p>
                <div className="w-full space-y-3">
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleLogout}
                    className="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 text-[15px] font-bold rounded-xl border border-red-100 transition-colors">
                    Yes, Sign me out
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowLogout(false)}
                    className="w-full py-4 bg-black/5 hover:bg-black/10 text-[#1A1A2E] text-[15px] font-bold rounded-xl transition-colors">
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
