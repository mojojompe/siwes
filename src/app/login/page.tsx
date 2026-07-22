"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Hash, Lock, ArrowRight } from "lucide-react";

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

export default function LoginPage() {
  const router = useRouter();
  const [matricNumber, setMatricNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fullMatric = `LCU/UG/${matricNumber}`;
    const res = await signIn("credentials", {
      redirect: false,
      matricNumber: fullMatric,
      password,
    });

    if (res?.error) {
      setError("Invalid matric number or password.");
      setLoading(false);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } else {
      router.push("/");
    }
  };

  return (
    <main className="min-h-[100dvh] relative flex flex-col bg-[#6CAADE] overflow-hidden">
      {/* Top Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-white relative z-10 min-h-[250px]">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={spring}
          className="w-28 h-28 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm shadow-xl"
        >
          <Image src="/icon.png" alt="Logo" width={112} height={112} className="w-full h-full object-cover rounded-full" />
        </motion.div>
        <h1 className="text-[32px] font-black tracking-tight text-center leading-none">
          SIWES<br/>
          <span className="text-[#1A1A2E]">TRACKER</span>
        </h1>
      </div>

      {/* Bottom Section */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full bg-white rounded-t-[2.5rem] p-8 pb-12 shadow-[0_-20px_40px_rgba(0,0,0,0.1)] relative z-20 flex-shrink-0 overflow-y-auto"
        style={{ maxHeight: "75vh" }}
      >
        <div className={`max-w-sm mx-auto ${shake ? "shake" : ""}`}>
          {/* Header */}
          <div className="mb-8 text-center">
            <h2 className="text-[26px] font-bold text-[#1A1A2E] tracking-tight">Welcome back</h2>
            <p className="text-[14px] text-black/45 font-medium mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error */}
            <AnimatePresenceInline show={!!error}>
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-medium">
                {error}
              </div>
            </AnimatePresenceInline>

            {/* Matric */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-black/40 uppercase tracking-[0.12em]">Matric Number</label>
              <div className="flex items-center input-premium overflow-hidden pr-3 bg-black/[0.03] border-transparent focus-within:border-[#6CAADE]/50 focus-within:bg-white focus-within:shadow-[0_4px_20px_rgba(108,170,222,0.15)] transition-all">
                <span className="pl-4 pr-2 py-3.5 text-[13px] mono font-600 text-[#6CAADE] whitespace-nowrap border-r border-black/8 mr-2 select-none">
                  LCU/UG/
                </span>
                <input
                  type="text"
                  required
                  value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value.toUpperCase())}
                  className="flex-1 py-3.5 bg-transparent focus:outline-none text-[14px] font-medium text-[#1A1A2E] mono"
                  placeholder="20/00000"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-black/40 uppercase tracking-[0.12em]">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 input-premium bg-black/[0.03] border-transparent focus:border-[#6CAADE]/50 focus:bg-white focus:shadow-[0_4px_20px_rgba(108,170,222,0.15)] transition-all text-[14px] font-medium text-[#1A1A2E]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Forgot Password Link placeholder if needed */}
            <div className="flex justify-end pt-1">
              <Link href="#" className="text-[12px] font-bold text-black/40 hover:text-[#6CAADE] transition-colors">
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              transition={spring}
              className="w-full py-4 mt-2 bg-[#1A1A2E] hover:bg-black text-white rounded-2xl flex items-center justify-center gap-2 font-bold text-[15px] shadow-[0_8px_20px_rgba(26,26,46,0.2)] disabled:opacity-60 transition-all"
            >
              {loading ? (
                <LoadingDots />
              ) : (
                <>
                  Login
                </>
              )}
            </motion.button>
          </form>
          
          <div className="relative flex items-center py-6">
            <div className="flex-grow border-t border-black/10"></div>
            <span className="flex-shrink-0 mx-4 text-black/30 text-[12px] font-bold uppercase tracking-wider">or</span>
            <div className="flex-grow border-t border-black/10"></div>
          </div>

          <Link href="/signup" className="block w-full text-center py-4 border-2 border-black/10 hover:border-black/20 text-[#1A1A2E] rounded-2xl font-bold text-[15px] transition-colors">
            Create an account
          </Link>
        </div>
      </motion.div>
    </main>
  );
}

function AnimatePresenceInline({ show, children }: { show: boolean; children: React.ReactNode }) {
  if (!show) return null;
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
    >
      {children}
    </motion.div>
  );
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 bg-white rounded-full"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}
