"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert } from "lucide-react";

export function GlobalGuard() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Only run if user is logged in, hasn't read the disclaimer, and isn't already on the disclaimer page
    if (session?.user && !(session.user as any).hasReadDisclaimer && pathname !== "/disclaimer") {
      const checkLogs = async () => {
        try {
          const res = await fetch("/api/logs");
          if (res.ok) {
            const data = await res.json();
            if (data.logs && data.logs.length >= 1) {
              setShowModal(true);
            }
          }
        } catch (err) {
          console.error("Failed to check logs for disclaimer guard:", err);
        }
      };
      checkLogs();
    } else {
      setShowModal(false);
    }
  }, [session, pathname]);

  return (
    <AnimatePresence>
      {showModal && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-[4px]" 
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} 
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-[101] bg-white rounded-t-[2rem] p-6 pb-12 shadow-[0_-24px_80px_rgba(0,0,0,0.2)]"
          >
            <div className="flex flex-col items-center text-center pt-2">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-5 border border-amber-100">
                <ShieldAlert className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="heading-display text-[22px] text-[#1A1A2E] mb-3">Important Notice</h2>
              <p className="text-[14px] text-black/60 font-medium mb-8 leading-relaxed px-2">
                Before you continue using the SIWES Tracker, you must read our disclaimer regarding official logbook usage.
              </p>
              <motion.button 
                whileTap={{ scale: 0.97 }} 
                onClick={() => {
                  setShowModal(false);
                  router.push("/disclaimer");
                }}
                className="w-full py-4 bg-[#1A1A2E] text-white text-[15px] font-bold rounded-xl shadow-lg shadow-black/10 transition-colors"
              >
                Read Full Disclaimer
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
