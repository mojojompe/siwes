"use client";

import { motion } from "framer-motion";

export function CircleProgress({ value }: { value: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="relative w-20 h-20">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(108,170,222,0.08)" strokeWidth="6" />
        <motion.circle
          cx="36" cy="36" r={r} fill="none"
          stroke="#6CAADE" strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="mono text-[18px] font-bold text-[#6CAADE] leading-none">{value}</span>
        <span className="text-[9px] font-bold text-black/30 uppercase tracking-wider">%</span>
      </div>
    </div>
  );
}
