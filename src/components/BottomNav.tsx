"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, CheckSquare, FileText, ChevronUp,
  Calendar, History, User, X, Flame, Bot, Info
} from "lucide-react";

const springConfig = { type: "spring" as const, stiffness: 500, damping: 35 };

export function BottomNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  const tabs = [
    { label: "Home", href: "/home", icon: Home },
    { label: "Tasks", href: "/todos", icon: CheckSquare },
    { label: "Notes", href: "/notes", icon: FileText },
  ];

  const moreTabs = [
    { label: "Timetable", href: "/timetable", icon: Calendar },
    { label: "Streaks", href: "/streaks", icon: Flame },
    { label: "AI Chat", href: "/chat", icon: Bot },
    { label: "Previous", href: "/previous", icon: History },
    { label: "Profile", href: "/profile", icon: User },
  ];

  const allMoreActive = moreTabs.some(t => pathname === t.href);

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowMore(false)}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>

      {/* More bottom sheet */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.96 }}
            transition={springConfig}
            className="fixed bottom-24 left-4 right-4 z-50 md:left-1/2 md:-translate-x-1/2 md:w-[380px]"
          >
            <div className="glass-card rounded-[1.75rem] overflow-hidden">
              {/* Header */}
              <div className="flex justify-between items-center px-5 pt-4 pb-3 border-b border-black/5">
                <span className="text-[11px] font-bold text-black/40 uppercase tracking-[0.15em]">More Screens</span>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setShowMore(false)}
                  className="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center text-black/40 hover:bg-black/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Items */}
              <div className="p-2">
                {moreTabs.map((tab, i) => {
                  const Icon = tab.icon;
                  const isActive = pathname === tab.href;
                  return (
                    <motion.div
                      key={tab.href}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, ...springConfig }}
                    >
                      {tab.label === "AI Chat" ? (
                        <button
                          onClick={() => {
                            setShowComingSoon(true);
                            setShowMore(false);
                          }}
                          className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${
                            isActive
                              ? "bg-[#3B5BDB]/10 text-[#3B5BDB]"
                              : "text-black/60 hover:bg-black/4 hover:text-black"
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isActive ? "bg-[#3B5BDB] shadow-[0_4px_12px_rgba(59,91,219,0.3)]" : "bg-black/5"
                          }`}>
                            <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-black/50"}`} />
                          </div>
                          <span className={`font-${isActive ? "700" : "500"} text-[15px]`}>{tab.label}</span>
                          <span className="ml-2 px-2 py-0.5 rounded-full bg-black/5 text-[10px] font-bold text-black/40 uppercase tracking-wider">
                           Coming Soon
                          </span>
                        </button>
                      ) : (
                        <Link
                          href={tab.href}
                          onClick={() => setShowMore(false)}
                          className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${
                            isActive
                              ? "bg-[#3B5BDB]/10 text-[#3B5BDB]"
                              : "text-black/60 hover:bg-black/4 hover:text-black"
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isActive ? "bg-[#3B5BDB] shadow-[0_4px_12px_rgba(59,91,219,0.3)]" : "bg-black/5"
                          }`}>
                            <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-black/50"}`} />
                          </div>
                          <span className={`font-${isActive ? "700" : "500"} text-[15px]`}>{tab.label}</span>
                          {isActive && (
                            <motion.div
                              layoutId="moreActive"
                              className="ml-auto w-1.5 h-1.5 rounded-full bg-[#3B5BDB]"
                            />
                          )}
                        </Link>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main nav pill */}
      <div className="fixed bottom-5 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[400px] z-50">
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, ...springConfig }}
          className="glass-card rounded-full p-2 flex items-center justify-between"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href || (pathname === "/" && tab.href === "/home");

            return (
              <Link key={tab.href} href={tab.href} className="flex-1">
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: "spring", stiffness: 600, damping: 30 }}
                  className={`relative flex items-center justify-center h-13 rounded-full transition-colors ${
                    isActive ? "text-[#3B5BDB]" : "text-black/35 hover:text-black/60"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBg"
                      className="absolute inset-0 rounded-full bg-[#3B5BDB]/10 border border-[#3B5BDB]/15"
                      transition={springConfig}
                    />
                  )}
                  <div className="relative z-10 flex flex-col items-center gap-0.5">
                    <Icon className={`transition-all duration-200 ${isActive ? "w-6 h-6" : "w-5 h-5"}`} />
                    <motion.span
                      initial={false}
                      animate={{ opacity: isActive ? 1 : 0, height: isActive ? "auto" : 0 }}
                      className="text-[10px] font-bold leading-none overflow-hidden"
                    >
                      {tab.label}
                    </motion.span>
                  </div>
                </motion.div>
              </Link>
            );
          })}

          {/* More button */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 600, damping: 30 }}
            onClick={() => setShowMore(!showMore)}
            className={`flex-1 relative flex items-center justify-center h-13 rounded-full transition-colors ${
              showMore || allMoreActive ? "text-[#3B5BDB]" : "text-black/35 hover:text-black/60"
            }`}
          >
            {(showMore || allMoreActive) && (
              <motion.div
                layoutId="activeTabBg"
                className="absolute inset-0 rounded-full bg-[#3B5BDB]/10 border border-[#3B5BDB]/15"
                transition={springConfig}
              />
            )}
            <div className="relative z-10 flex flex-col items-center gap-0.5">
              <motion.div
                animate={{ rotate: showMore ? 180 : 0 }}
                transition={springConfig}
              >
                <ChevronUp className="w-6 h-6" />
              </motion.div>
              <span className="text-[10px] font-bold leading-none">More</span>
            </div>
          </motion.button>
        </motion.div>
      </div>
      {/* Coming Soon Drawer */}
      <AnimatePresence>
        {showComingSoon && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowComingSoon(false)} className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={springConfig}
              className="fixed bottom-0 left-0 right-0 z-50 glass-card rounded-t-[2rem] p-6 pb-28 shadow-[0_-20px_60px_rgba(0,0,0,0.1)]"
            >
              <div className="flex flex-col items-center text-center pt-2">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-5 shadow-inner">
                  <Info className="w-7 h-7 text-[#3B5BDB]" />
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
    </>
  );
}
