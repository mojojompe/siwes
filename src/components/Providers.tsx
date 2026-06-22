"use client";

import { SessionProvider } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { RemindersManager } from "./RemindersManager";
import { GlobalGuard } from "./GlobalGuard";
import { motion, AnimatePresence } from "framer-motion";
import { InstallPrompt } from "./InstallPrompt";
import gsap from "gsap";

export function Providers({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const iconRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const sponsorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showSplash) return;

    const tl = gsap.timeline();
    tl.fromTo(iconRef.current,
      { scale: 0, opacity: 0, rotate: -10 },
      { scale: 1, opacity: 1, rotate: 0, duration: 0.7, ease: "back.out(1.7)" }
    )
    .fromTo(titleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.2"
    )
    .fromTo(sponsorRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "-=0.1"
    );

    const timer = setTimeout(() => setShowSplash(false), 2800);
    return () => clearTimeout(timer);
  }, [showSplash]);

  return (
    <SessionProvider>
      <RemindersManager />
      <GlobalGuard />
      <AnimatePresence mode="wait">
        {showSplash ? (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white overflow-hidden"
          >
            {/* Ambient orbs */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-100/60 blur-[80px] clay-float" />
            <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-indigo-100/50 blur-[60px] clay-float-delay" />
            
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-5">
              <div ref={iconRef} className="w-28 h-28 rounded-[2rem] overflow-hidden shadow-[0_24px_64px_rgba(59,91,219,0.2)] border border-black/5">
                <img src="/icon.png" alt="Siwes Tracker" className="w-full h-full object-cover" />
              </div>
              <h1 ref={titleRef} className="heading-display text-4xl text-[#1A1A2E] opacity-0">
                Siwes Tracker
              </h1>
            </div>

            {/* Sponsor */}
            <div ref={sponsorRef} className="absolute bottom-10 flex flex-col items-center opacity-0">
              <span className="text-xs font-medium tracking-[0.2em] text-black/30 uppercase">Sponsored by</span>
              <a href="https://waltiklabs.vercel.app" target="_blank" rel="noopener noreferrer" className="text-base font-bold text-black/50 mt-0.5 hover:text-[#3B5BDB] transition-colors">Waltik Labs</a>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col h-full"
          >
            {children}
            <InstallPrompt />
          </motion.div>
        )}
      </AnimatePresence>
    </SessionProvider>
  );
}
