"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Lock, BookOpen, Hash, ArrowRight, Mail } from "lucide-react";

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

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

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [department, setDepartment] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    const fullMatric = `LCU/UG/${matricNumber}`;
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, department, matricNumber: fullMatric, email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 min-h-screen relative flex flex-col items-center justify-center p-5 overflow-hidden mesh-bg">
      {/* Sponsored by on background */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 left-0 right-0 text-center text-[11px] font-bold tracking-[0.18em] uppercase text-black/25"
      >
        Sponsored by Waltik Labs
      </motion.p>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm glass-card rounded-[2rem] overflow-hidden"
      >
        <div className="p-7">
          <div className="mb-6">
            <h1 className="heading-display text-[28px] text-[#1A1A2E]">Create account</h1>
            <p className="text-[14px] text-black/45 font-medium mt-1">Start tracking your SIWES journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-medium"
              >
                {error}
              </motion.div>
            )}

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-black/40 uppercase tracking-[0.12em]">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/25" />
                  <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 input-premium text-[13px] font-medium" placeholder="John" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-black/40 uppercase tracking-[0.12em]">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/25" />
                  <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 input-premium text-[13px] font-medium" placeholder="Doe" />
                </div>
              </div>
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-black/40 uppercase tracking-[0.12em]">Department</label>
              <div className="relative">
                <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/25" />
                <input type="text" required value={department} onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 input-premium text-[14px] font-medium" placeholder="Computer Science" />
              </div>
            </div>

            {/* Matric Number */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-black/40 uppercase tracking-[0.12em]">Matric Number</label>
              <div className="flex items-center input-premium overflow-hidden pr-3">
                <span className="pl-4 pr-2 py-3.5 text-[13px] mono font-600 text-[#3B5BDB] whitespace-nowrap border-r border-black/8 mr-2 select-none">
                  LCU/UG/
                </span>
                <input type="text" required value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value.toUpperCase())}
                  className="flex-1 py-3.5 bg-transparent focus:outline-none text-[14px] mono font-medium"
                  placeholder="20/00000" />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-black/40 uppercase tracking-[0.12em]">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/25" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 input-premium text-[14px] font-medium" placeholder="student@university.edu" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-black/40 uppercase tracking-[0.12em]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/25" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 input-premium text-[14px] font-medium" placeholder="••••••••" />
              </div>
            </div>

            <motion.button
              type="submit" disabled={loading}
              whileTap={{ scale: 0.97 }}
              transition={spring}
              className="w-full py-4 mt-2 btn-primary rounded-xl flex items-center justify-center gap-2 font-bold text-[15px] disabled:opacity-60"
            >
              {loading ? <LoadingDots /> : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-[13px] text-black/40 font-medium">
            Have an account?{" "}
            <Link href="/login" className="text-[#3B5BDB] font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
