"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Loader2, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";

interface EmailModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

export function EmailModal({ isOpen, onSuccess }: EmailModalProps) {
  const { data: session, update } = useSession();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/user/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update email");
      }

      // Update NextAuth session so it persists without reload
      await update({
        ...session,
        user: { ...session?.user, email }
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={spring}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 glass-card rounded-[2rem] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)] max-w-sm mx-auto overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#6CAADE]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-5 shadow-inner">
                <Mail className="w-8 h-8 text-[#6CAADE]" />
              </div>
              
              <h2 className="text-[20px] font-bold text-[#1A1A2E] mb-2 leading-tight">Secure Your Account</h2>
              <p className="text-[13px] text-black/50 font-medium mb-6 leading-relaxed max-w-[260px]">
                Please add an email address to your profile to enable payment receipts and account recovery.
              </p>

              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/25" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 input-premium text-[14px] font-medium"
                    placeholder="student@university.edu"
                  />
                </div>

                {error && (
                  <p className="text-[12px] text-red-500 font-medium text-left px-1">{error}</p>
                )}

                <motion.button
                  type="submit"
                  disabled={loading || !email}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-4 bg-[#1A1A2E] text-white text-[15px] font-bold rounded-xl shadow-[0_8px_20px_rgba(26,26,46,0.3)] hover:bg-[#2A2A4A] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Save Email</span><ArrowRight className="w-4 h-4" /></>}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
