"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { ShieldAlert, CheckCircle2, ChevronDown, Loader2, X } from "lucide-react";

export default function DisclaimerPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);

  const checkScroll = () => {
    if (!contentRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    // Allow a margin of error of 50px for different screen sizes and fractional pixels
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      setHasScrolledToBottom(true);
    }
  };

  const handleScroll = () => {
    checkScroll();
  };

  // Check if it's already fully visible on mount
  useEffect(() => {
    // Slight delay to allow DOM to fully render
    const timeout = setTimeout(checkScroll, 100);
    return () => clearTimeout(timeout);
  }, []);

  const handleAcknowledge = async () => {
    if (!hasScrolledToBottom) return;
    setSaving(true);
    try {
      await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updateType: "disclaimer" })
      });
      // Update local session to avoid redirect loop
      await update({
        ...session,
        user: { ...session?.user, hasReadDisclaimer: true }
      });
      router.push("/home");
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  return (
    <main className="flex-1 mesh-bg min-h-screen flex flex-col h-screen overflow-hidden relative">
      <div className="pt-12 pb-6 px-6 bg-white/50 backdrop-blur-md border-b border-black/5 z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="heading-display text-[20px] text-[#1A1A2E]">Important Disclaimer</h1>
            <p className="text-[12px] font-medium text-black/50">Please read carefully before continuing</p>
          </div>
        </div>
      </div>

      <div 
        ref={contentRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-8 space-y-6 relative"
      >
        <section className="glass-card rounded-2xl p-6">
          <h2 className="text-[16px] font-bold text-[#1A1A2E] mb-3">Not a Replacement for your Logbook</h2>
          <p className="text-[14px] text-black/60 leading-relaxed font-medium">
            The SIWES Tracker app is designed as an interactive guide and personal diary to help you 
            keep track of your daily activities, tasks, and notes during your industrial attachment.
            <br/><br/>
            <strong className="text-red-500">It is NOT a replacement for your official ITF SIWES Logbook.</strong> 
            You must still fill out, sign, and submit your physical (or institution-mandated official) 
            logbook to your industry-based supervisor and university.
          </p>
        </section>

        <section className="glass-card rounded-2xl p-6">
          <h2 className="text-[16px] font-bold text-[#1A1A2E] mb-3">What We Do</h2>
          <ul className="space-y-3">
            {[
              "Provide a digital backup of your daily learnings",
              "Remind you to fill your logbook and complete tasks",
              "Offer tips and guidance on placement, registration, and defense",
              "Help you organize your workflow with a built-in timetable",
              "Allow you to export your data for reference"
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-[14px] text-black/60 font-medium leading-relaxed">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-card rounded-2xl p-6 mb-20">
          <h2 className="text-[16px] font-bold text-[#1A1A2E] mb-3">What We Do Not Do</h2>
          <ul className="space-y-3">
            {[
              "We do not submit your logbook to ITF or your institution",
              "We do not generate official supervisor signatures",
              "We are not affiliated with the Industrial Training Fund (ITF)",
              "We cannot grade or assess your SIWES performance"
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-[14px] text-black/60 font-medium leading-relaxed">
                <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>
        
        {!(session?.user as any)?.hasReadDisclaimer && !hasScrolledToBottom && (
          <div className="absolute bottom-28 left-0 right-0 flex justify-center pointer-events-none animate-bounce">
            <div className="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-[12px] font-bold flex items-center gap-2">
              Scroll to bottom to acknowledge
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>

      {!(session?.user as any)?.hasReadDisclaimer && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent z-20">
          <motion.button
            disabled={!hasScrolledToBottom || saving}
            whileTap={hasScrolledToBottom ? { scale: 0.97 } : {}}
            onClick={handleAcknowledge}
            className={`w-full py-4 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all ${
              hasScrolledToBottom 
                ? "bg-[#1A1A2E] text-white shadow-xl shadow-black/10" 
                : "bg-black/5 text-black/30"
            }`}
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "I Understand and Acknowledge"}
          </motion.button>
        </div>
      )}
    </main>
  );
}
