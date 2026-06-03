"use client";

import { SessionProvider } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InstallPrompt } from "./InstallPrompt";

export function Providers({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500); // Show splash for 2.5 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <SessionProvider>
      <AnimatePresence>
        {showSplash ? (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-900"
          >
            <div className="flex flex-col items-center space-y-4">
              {/* Optional: we can put the user's icon here once they provide it, we use a placeholder for now */}
              <div className="w-32 h-32 flex items-center justify-center mb-4 drop-shadow-2xl">
                <img src="/icon.png" alt="Siwes Tracker Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Siwes Tracker</h1>
            </div>
            
            <div className="absolute bottom-10 flex flex-col items-center opacity-70">
              <span className="text-sm font-medium tracking-wide text-slate-500">Sponsored by</span>
              <span className="text-lg font-bold text-slate-800">Waltik Labs</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
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
