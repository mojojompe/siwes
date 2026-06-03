"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, CheckSquare, FileText, ChevronUp, Calendar, History, User, X } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  const tabs = [
    { label: "Home", href: "/home", icon: Home },
    { label: "ToDo", href: "/todos", icon: CheckSquare },
    { label: "Notes", href: "/notes", icon: FileText },
  ];

  const moreTabs = [
    { label: "Timetable", href: "/timetable", icon: Calendar },
    { label: "Previous", href: "/previous", icon: History },
    { label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <>
      {/* More Modal Overlay */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMore(false)}
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* More Modal */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-4 z-50 bg-white rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden w-48"
          >
            <div className="flex flex-col p-2">
              <div className="flex justify-between items-center px-3 py-2 border-b border-slate-100 mb-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">More</span>
                <button onClick={() => setShowMore(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {moreTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = pathname === tab.href;
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    onClick={() => setShowMore(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                      isActive ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-600 font-medium hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pill-in-Pill Bottom Navigation */}
      <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[400px] z-50">
        <div className="bg-white/80 backdrop-blur-2xl p-2 rounded-full shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] border border-white flex items-center justify-between">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href || (pathname === '/' && tab.href === '/home');
            
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative flex items-center justify-center w-16 h-12 rounded-full transition-all duration-300 ${
                  isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-slate-50"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex flex-col items-center">
                  <Icon className={`w-5 h-5 ${isActive ? "mb-0.5" : ""}`} />
                  {isActive && <span className="text-[10px] font-bold leading-none">{tab.label}</span>}
                </div>
              </Link>
            );
          })}

          <button
            onClick={() => setShowMore(!showMore)}
            className={`relative flex items-center justify-center w-16 h-12 rounded-full transition-all duration-300 ${
              showMore ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {showMore && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-slate-50"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <div className="relative z-10 flex flex-col items-center">
              <ChevronUp className={`w-6 h-6 transition-transform duration-300 ${showMore ? "rotate-180 mb-0.5" : ""}`} />
              {showMore && <span className="text-[10px] font-bold leading-none">More</span>}
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
