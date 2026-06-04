"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Lightbulb, FileText, Stamp, Briefcase, GraduationCap, ChevronRight, X } from "lucide-react";

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

const TIPS_DATA = [
  {
    id: "doc-placement",
    title: "Documentation & Placement",
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-100",
    content: [
      { title: "Get Your Introduction Letter", desc: "Collect an introductory or placement letter from your departmental SIWES coordinator." },
      { title: "Secure an Attachment", desc: "Apply to organizations, companies, or government agencies relevant to your course of study. You can apply online (e.g., via LinkedIn or company emails) or submit your CV and letter physically." },
      { title: "Acceptance Letter", desc: "Once accepted, get an official Acceptance Letter from the organization." },
      { title: "Submit to School", desc: "Return the Acceptance Letter to your institution's SIWES unit to finalize your placement." }
    ]
  },
  {
    id: "registration",
    title: "Registration with ITF",
    icon: Stamp,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    content: [
      { title: "Collect SIWES Documents", desc: "Obtain the necessary official documents from your school (e.g., ITF Form 8, SCAF, and Logbook)." },
      { title: "Fill Forms", desc: "Fill out your Job Reporting Form within the first two weeks of resuming at your workplace and stamp your documents appropriately." }
    ]
  },
  {
    id: "during-attachment",
    title: "During the Attachment",
    icon: Briefcase,
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-100",
    content: [
      { title: "Maintain the Logbook", desc: "Record all your daily activities, tasks, and observations in the SIWES Logbook." },
      { title: "Get Endorsements", desc: "Have your industry-based supervisor sign your logbook weekly and stamp it periodically." },
      { title: "Supervision", desc: "Cooperate with your school's visiting supervisor when they come to assess you at your workplace." }
    ]
  },
  {
    id: "defense",
    title: "Final Submission & Defense",
    icon: GraduationCap,
    color: "text-purple-500",
    bg: "bg-purple-50",
    border: "border-purple-100",
    content: [
      { title: "Logbook Submission", desc: "Have your employer review, sign, and seal your logbook and Evaluation Form at the end of the program." },
      { title: "Write the Report", desc: "Type and bind a comprehensive SIWES technical report detailing everything you learned and accomplished during your industrial training." },
      { title: "Defense", desc: "Submit your report and logbook to your department, and prepare for an oral defense of your SIWES experience before a panel of lecturers." }
    ]
  }
];

export default function TipsPage() {
  const router = useRouter();
  const [selectedTip, setSelectedTip] = useState<typeof TIPS_DATA[0] | null>(null);

  return (
    <main className="p-5 pb-32 flex-1 mesh-bg min-h-screen relative">
      <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="flex items-center gap-4 sticky top-0 z-[60] pt-5 pb-4 -mx-5 px-5 mb-8">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-black/50 border border-black/5 hover:text-black transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
        <h1 className="heading-display text-[22px] text-[#1A1A2E]">SIWES Tips</h1>
      </motion.header>

      <div className="space-y-4 relative z-10">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, ...spring }} className="rounded-[1.75rem] p-6 mb-6 flex gap-4 items-center bg-gradient-to-br from-[#3B5BDB] to-[#1A1A2E] text-white shadow-xl shadow-[#3B5BDB]/20">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center border border-white/10 flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="heading-display text-[18px] text-white">Your Success Guide</h2>
            <p className="text-[13px] text-white/70 font-medium mt-0.5">Follow these tips to ace your SIWES program without stress.</p>
          </div>
        </motion.div>

        {TIPS_DATA.map((tip, idx) => {
          const Icon = tip.icon;
          return (
            <motion.div
              key={tip.id}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + (idx * 0.1), ...spring }}
              onClick={() => setSelectedTip(tip)}
              className="glass-card rounded-[1.5rem] p-4 flex items-center justify-between cursor-pointer hover:bg-black/3 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${tip.bg} ${tip.border} ${tip.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#1A1A2E] group-hover:text-[#3B5BDB] transition-colors">{tip.title}</h3>
                  <p className="text-[12px] text-black/50 font-medium">{tip.content.length} Steps</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-[#3B5BDB]/10 transition-colors">
                <ChevronRight className="w-4 h-4 text-black/40 group-hover:text-[#3B5BDB] transition-colors" />
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedTip && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedTip(null)} className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px]" />
            <motion.div
              initial={{ y: "100%", opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: "100%", opacity: 0, scale: 0.95 }} transition={spring}
              className="fixed top-24 bottom-0 left-0 right-0 z-[101] bg-white rounded-t-[2rem] p-6 shadow-2xl overflow-y-auto flex flex-col"
            >
              <div className="flex items-center justify-between mb-8 sticky top-0 bg-white/90 backdrop-blur pt-2 pb-4 z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${selectedTip.bg} ${selectedTip.border} ${selectedTip.color}`}>
                    <selectedTip.icon className="w-5 h-5" />
                  </div>
                  <h2 className="heading-display text-[20px] text-[#1A1A2E]">{selectedTip.title}</h2>
                </div>
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => setSelectedTip(null)} className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-black/40 hover:bg-black/10">
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
              
              <div className="space-y-6 pb-20">
                {selectedTip.content.map((item, i) => (
                  <div key={i} className="relative pl-6">
                    {/* Timeline line */}
                    {i !== selectedTip.content.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-[-24px] w-0.5 bg-black/5" />
                    )}
                    {/* Timeline dot */}
                    <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white ${selectedTip.bg} ${selectedTip.color} flex items-center justify-center`}>
                      <div className="w-2 h-2 rounded-full bg-current" />
                    </div>
                    
                    <h3 className="text-[16px] font-bold text-[#1A1A2E] mb-2">{item.title}</h3>
                    <p className="text-[14px] text-black/60 leading-relaxed font-medium bg-black/3 p-4 rounded-xl border border-black/5">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="mt-auto sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-8 pb-4">
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setSelectedTip(null)} className="w-full py-4 btn-primary rounded-xl font-bold text-[15px]">
                  Got it!
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
