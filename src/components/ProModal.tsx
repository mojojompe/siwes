"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Image as ImageIcon, MessageSquare, CheckCircle, X, Crown, Loader2 } from "lucide-react";
import { usePaystackPayment } from "react-paystack";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export function ProModal({ isOpen, onClose, userEmail }: ProModalProps) {
  const [verifying, setVerifying] = useState(false);
  const router = useRouter();
  const { update } = useSession();

  const config = {
    reference: (new Date()).getTime().toString() + Math.random().toString(36).substring(7),
    email: userEmail || "student@siwes.app",
    amount: 1500 * 100, // ₦1500 in kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_placeholder",
  };

  const initializePayment = usePaystackPayment(config);

  const handleSuccess = async (reference: any) => {
    setVerifying(true);
    try {
      const res = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: reference.reference }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Force NextAuth session refresh locally so the new token reflects isPro: true immediately
        await update({ isPro: true });
        window.location.reload();
      } else {
        toast.error("Payment verification failed. Please contact support.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during verification.");
    } finally {
      setVerifying(false);
      onClose();
    }
  };

  const handleClose = () => {
    // User closed Paystack modal without paying
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-[6px]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-[90%] max-w-sm glass-card bg-white rounded-[2rem] p-6 shadow-2xl overflow-hidden"
          >
            {/* Top gradient blur */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-400/20 blur-[50px] rounded-full" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-600/20 blur-[50px] rounded-full" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <button
                onClick={onClose}
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-black/40 hover:bg-black/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>

              <h2 className="heading-display text-[22px] text-[#1A1A2E] mb-2">SIWES Pro</h2>
              <p className="text-[13px] text-black/60 font-medium mb-6 leading-relaxed">
                Unlock the ultimate tools to make your logbook professional and flawless. One-time payment for lifetime access.
              </p>

              <div className="w-full space-y-4 mb-8 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#1A1A2E]">Media Uploads</h4>
                    <p className="text-[12px] font-medium text-black/50 leading-snug mt-0.5">Attach images and diagrams directly to your daily logs.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#1A1A2E]">Unlimited AI Rephraser</h4>
                    <p className="text-[12px] font-medium text-black/50 leading-snug mt-0.5">Instantly transform rough notes into professional entries.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#1A1A2E]">Unlimited AI Chat</h4>
                    <p className="text-[12px] font-medium text-black/50 leading-snug mt-0.5">Ask questions and get instant help with your SIWES tasks.</p>
                  </div>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={verifying}
                onClick={() => initializePayment({ onSuccess: handleSuccess, onClose: handleClose })}
                className="w-full py-4 bg-[#1A1A2E] text-white text-[15px] font-bold rounded-xl shadow-[0_8px_20px_rgba(26,26,46,0.3)] hover:bg-[#2A2A4A] transition-all flex items-center justify-center gap-2"
              >
                {verifying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Unlock Pro for ₦1,500"}
              </motion.button>
              
              <p className="text-[10px] font-bold text-black/30 mt-4 uppercase tracking-wider">Secured by Paystack</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
