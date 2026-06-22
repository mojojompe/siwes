"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
    <main className="flex-1 min-h-screen relative flex flex-col items-center justify-center p-5 overflow-hidden mesh-bg">
      {/* "Sponsored by Waltik Labs" on background */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 left-0 right-0 text-center text-[11px] font-bold tracking-[0.18em] uppercase text-black/25"
      >
        Sponsored by <a href="https://waltiklabs.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-[#3B5BDB] transition-colors">Waltik Labs</a>
      </motion.p>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`w-full max-w-sm glass-card rounded-[2rem] overflow-hidden ${shake ? "shake" : ""}`}
      >
        <div className="p-7">
          {/* Header */}
          <div className="mb-7">
            
            <h1 className="heading-display text-[28px] text-[#1A1A2E]">Welcome back</h1>
            <p className="text-[14px] text-black/45 font-medium mt-1">Sign in to your SIWES tracker</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error */}
            <AnimatePresenceInline show={!!error}>
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-medium">
                {error}
              </div>
            </AnimatePresenceInline>

            {/* Matric */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-black/40 uppercase tracking-[0.12em]">Matric Number</label>
              <div className="flex items-center input-premium overflow-hidden pr-3">
                <span className="pl-4 pr-2 py-3.5 text-[13px] mono font-600 text-[#3B5BDB] whitespace-nowrap border-r border-black/8 mr-2 select-none">
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
                  className="w-full pl-11 pr-4 py-3.5 input-premium text-[14px] font-medium text-[#1A1A2E]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              transition={spring}
              className="w-full py-4 mt-2 btn-primary rounded-xl flex items-center justify-center gap-2 font-bold text-[15px] disabled:opacity-60"
            >
              {loading ? (
                <LoadingDots />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-[13px] text-black/40 font-medium">
            No account?{" "}
            <Link href="/signup" className="text-[#3B5BDB] font-bold hover:underline">
              Create one
            </Link>
          </p>
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
