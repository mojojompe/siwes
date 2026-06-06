"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Lightbulb, FileText, Stamp, Briefcase, GraduationCap, ChevronRight, X } from "lucide-react";

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

const TIPS_DATA = [
  {
    id: "phase-1",
    title: "Phase 1: Commencement",
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-100",
    content: [
      { 
        title: "1. The SIWES Job Reporting Form (IT/LCU/001)", 
        desc: "Purpose: This internal university form officially notifies the LCU SIWES center that you have commenced your training and provides your location so they can plan supervisory visits.\n\nHow to Fill:\n• Fill in your personal details, including your Surname, Matric No., Course of Study, and Level.\n• Provide full details of your placement, including the company name, company address, and the name and title of your immediate supervisor.\n• Include your personal mailing address, residence during the training, and your guardian's contact details.\n• Have your industry supervisor apply their signature, date, and official stamp at the bottom.\n\nWhere to Submit: You must submit this physically to the SIWES Co-ordinating Centre at the Senate Building of the university immediately after your training commences."
      },
      { 
        title: "2. ITF Students Commencement of Attachment Form (SCAF)", 
        desc: "Purpose: This registers you officially with the national ITF body for monitoring and eventual payment of your SIWES allowance.\n\nHow to Fill:\n• Fill in the top section with the local ITF Area Office, the Name of the Organization, Location Address, Institution, and the Organization's contact details.\n• In the table provided, fill in your Name, Matric No., Course of Study, the Period of Attachment in Months, and the exact Dates of Commencement and Completion.\n• Ensure your employer signs, dates, and stamps the bottom left corner.\n\nWhere to Submit: The completed SCAF must be sent to the nearest ITF Area Office (the branch closest to your employer's location) within the first 2 weeks of commencement."
      }
    ]
  },
  {
    id: "phase-2",
    title: "Phase 2: During Attachment",
    icon: Briefcase,
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-100",
    content: [
      { 
        title: "Maintain a Daily Logbook", 
        desc: "While you are working, you will need to maintain a daily Logbook detailing your tasks (where the Siwes Tracker comes in). This must be signed weekly by your industry supervisor."
      },
      { 
        title: "Institutional Supervision", 
        desc: "During this period, an institutional supervisor from your university will visit your workplace to assess your progress, check your logbook, and evaluate the company's facilities. Their assessment will later be formally recorded in Part C of ITF Form 8."
      }
    ]
  },
  {
    id: "phase-3",
    title: "Phase 3: End of the Program",
    icon: GraduationCap,
    color: "text-purple-500",
    bg: "bg-purple-50",
    border: "border-purple-100",
    content: [
      { 
        title: "1. SIWES Employee's Evaluation Form", 
        desc: "Purpose: A university-specific grading sheet where your employer assesses your workplace conduct, soft skills, and technical application.\n\nHow to Fill:\n• Student: You must complete items 1 through 6 (Name, Matric No., Course, Company Name, Address, and Dates of Attachment) before handing the form over to your industrial supervisor.\n• Employer: Your supervisor will grade you on metrics like Attendance, Punctuality, Creativity, and Application of Practical Skills. They will assign an Overall Assessment score ranging from Excellent to Fail. They will also sign, date, and indicate how many students they'd like to take from the institution in the future.\n\nWhere to Submit: This form must be returned under confidential cover (sealed in an envelope by the employer) and delivered through you back to the university."
      },
      { 
        title: "2. ITF FORM 8 (End of Program Report Sheet)", 
        desc: "Purpose: The master document required by the ITF to confirm completion and process your stipend. It is divided into three distinct parts.\n\nHow to Fill:\n• PART A (Student): You fill this out. Enter your academic details, the company's details, the exact duration of your attachment, and provide a brief written outline of the experience you acquired. Sign and date it.\n• PART B (Employer): Hand it to your industrial supervisor. They will state whether they agree with your outline in Part A, evaluate your overall performance, indicate if they would accept you for future attachments, and provide their official details, signature, and stamp.\n• PART C (Institution): You submit the form to your university SIWES coordinator. They will log the number of supervision visits made, assess the company's facilities, officially grade your performance (A, B, C, or D), and apply their signature and stamp.\n\nWhere to Submit: Employers are instructed to forward their completed sections to the respective institutions under seal. Once your university completely fills out Part C, the finalized Form 8 is returned to the ITF to close out your program."
      }
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
                    <p className="text-[14px] text-black/60 leading-relaxed font-medium bg-black/3 p-4 rounded-xl border border-black/5 whitespace-pre-wrap">
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
