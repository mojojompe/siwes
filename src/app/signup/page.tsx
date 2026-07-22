"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, BookOpen, ArrowRight, Mail, ChevronLeft, CheckCircle2 } from "lucide-react";

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
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [department, setDepartment] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const calculateStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strengthScore = calculateStrength(password);
  
  const getStrengthColor = (index: number) => {
    if (strengthScore === 0) return "bg-black/10";
    if (strengthScore <= 2) return index < strengthScore ? "bg-red-400" : "bg-black/10";
    if (strengthScore === 3) return index < strengthScore ? "bg-orange-400" : "bg-black/10";
    return index < strengthScore ? "bg-green-500" : "bg-black/10";
  };

  const getStrengthText = () => {
    if (strengthScore === 0) return "Enter password";
    if (strengthScore <= 2) return "Weak";
    if (strengthScore === 3) return "Good";
    return "Strong";
  };

  const handleNext = () => {
    if (!firstName || !lastName || !department || !matricNumber) {
      setError("Please fill in all personal details.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all security fields.");
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
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
    <main className="min-h-[100dvh] relative flex flex-col bg-[#6CAADE] overflow-hidden">
      {/* Top Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-white relative z-10 min-h-[220px]">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={spring}
          className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-5 backdrop-blur-sm shadow-xl"
        >
          <Image src="/icon.png" alt="Logo" width={96} height={96} className="w-full h-full object-cover rounded-full" />
        </motion.div>
        <h1 className="text-[28px] font-black tracking-tight text-center leading-none">
          CREATE<br/>
          <span className="text-[#1A1A2E]">ACCOUNT</span>
        </h1>
      </div>

      {/* Bottom Section */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full bg-white rounded-t-[2.5rem] p-8 pb-12 shadow-[0_-20px_40px_rgba(0,0,0,0.1)] relative z-20 flex-shrink-0 overflow-y-auto"
        style={{ maxHeight: "80vh" }}
      >
        <div className="max-w-sm mx-auto">
          <div className="mb-6 flex items-center justify-between text-center justify-center w-full">
            <div>
              <h2 className="text-[26px] font-bold text-[#1A1A2E] tracking-tight">
                {step === 1 ? "Personal details" : "Security setup"}
              </h2>
              <p className="text-[14px] text-black/45 font-medium mt-1">
                {step === 1 ? "Start tracking your SIWES journey" : "Secure your new account"}
              </p>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="px-4 py-3 mb-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-medium"
            >
              {error}
            </motion.div>
          )}

          <div className="relative">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={spring}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-black/40 uppercase tracking-[0.12em]">First Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/25" />
                        <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)}
                          className="w-full pl-9 pr-3 py-3 input-premium bg-black/[0.03] border-transparent focus:border-[#6CAADE]/50 focus:bg-white focus:shadow-[0_4px_20px_rgba(108,170,222,0.15)] transition-all text-[13px] font-medium" placeholder="John" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-black/40 uppercase tracking-[0.12em]">Last Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/25" />
                        <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)}
                          className="w-full pl-9 pr-3 py-3 input-premium bg-black/[0.03] border-transparent focus:border-[#6CAADE]/50 focus:bg-white focus:shadow-[0_4px_20px_rgba(108,170,222,0.15)] transition-all text-[13px] font-medium" placeholder="Doe" />
                      </div>
                    </div>
                  </div>

                  {/* Department */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-black/40 uppercase tracking-[0.12em]">Department</label>
                    <div className="relative">
                      <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/25" />
                      <input type="text" required value={department} onChange={(e) => setDepartment(e.target.value)}
                        className="w-full pl-10 pr-4 py-3.5 input-premium bg-black/[0.03] border-transparent focus:border-[#6CAADE]/50 focus:bg-white focus:shadow-[0_4px_20px_rgba(108,170,222,0.15)] transition-all text-[14px] font-medium" placeholder="Computer Science" />
                    </div>
                  </div>

                  {/* Matric Number */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-black/40 uppercase tracking-[0.12em]">Matric Number</label>
                    <div className="flex items-center input-premium overflow-hidden pr-3 bg-black/[0.03] border-transparent focus-within:border-[#6CAADE]/50 focus-within:bg-white focus-within:shadow-[0_4px_20px_rgba(108,170,222,0.15)] transition-all">
                      <span className="pl-4 pr-2 py-3.5 text-[13px] mono font-600 text-[#6CAADE] whitespace-nowrap border-r border-black/8 mr-2 select-none">
                        LCU/UG/
                      </span>
                      <input type="text" required value={matricNumber}
                        onChange={(e) => setMatricNumber(e.target.value.toUpperCase())}
                        className="flex-1 py-3.5 bg-transparent focus:outline-none text-[14px] mono font-medium"
                        placeholder="20/00000" />
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    onClick={handleNext}
                    whileTap={{ scale: 0.97 }}
                    transition={spring}
                    className="w-full py-4 mt-2 bg-[#1A1A2E] hover:bg-black text-white rounded-2xl flex items-center justify-center gap-2 font-bold text-[15px] shadow-[0_8px_20px_rgba(26,26,46,0.2)] transition-all"
                  >
                    <span>Next Step</span><ArrowRight className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={spring}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-black/40 uppercase tracking-[0.12em]">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/25" />
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 input-premium bg-black/[0.03] border-transparent focus:border-[#6CAADE]/50 focus:bg-white focus:shadow-[0_4px_20px_rgba(108,170,222,0.15)] transition-all text-[14px] font-medium" placeholder="student@university.edu" />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-black/40 uppercase tracking-[0.12em]">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/25" />
                      <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 input-premium bg-black/[0.03] border-transparent focus:border-[#6CAADE]/50 focus:bg-white focus:shadow-[0_4px_20px_rgba(108,170,222,0.15)] transition-all text-[14px] font-medium" placeholder="••••••••" />
                    </div>
                    {/* Strength Checker */}
                    {password && (
                      <div className="pt-2 px-1">
                        <div className="flex gap-1.5 h-1.5 w-full">
                          {[0, 1, 2, 3].map((index) => (
                            <div key={index} className={`flex-1 rounded-full transition-colors duration-300 ${getStrengthColor(index)}`} />
                          ))}
                        </div>
                        <p className={`text-[10px] font-bold mt-1.5 ${strengthScore === 4 ? "text-green-600" : "text-black/40"}`}>
                          Strength: {getStrengthText()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-black/40 uppercase tracking-[0.12em]">Confirm Password</label>
                    <div className="relative">
                      <CheckCircle2 className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${confirmPassword && password === confirmPassword ? "text-green-500" : "text-black/25"}`} />
                      <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 input-premium bg-black/[0.03] border-transparent focus:border-[#6CAADE]/50 focus:bg-white focus:shadow-[0_4px_20px_rgba(108,170,222,0.15)] transition-all text-[14px] font-medium" placeholder="••••••••" />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <motion.button
                      type="button"
                      onClick={() => setStep(1)}
                      whileTap={{ scale: 0.95 }}
                      className="w-14 h-[52px] rounded-2xl bg-black/5 flex items-center justify-center text-black/50 hover:text-black hover:bg-black/10 transition-colors flex-shrink-0"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      type="submit" disabled={loading || password !== confirmPassword}
                      whileTap={{ scale: 0.97 }}
                      transition={spring}
                      className="flex-1 h-[52px] bg-[#1A1A2E] hover:bg-black text-white rounded-2xl flex items-center justify-center gap-2 font-bold text-[15px] shadow-[0_8px_20px_rgba(26,26,46,0.2)] disabled:opacity-60 transition-all"
                    >
                      {loading ? <LoadingDots /> : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
          
          <div className="relative flex items-center py-6 mt-4">
            <div className="flex-grow border-t border-black/10"></div>
            <span className="flex-shrink-0 mx-4 text-black/30 text-[12px] font-bold uppercase tracking-wider">or</span>
            <div className="flex-grow border-t border-black/10"></div>
          </div>

          <Link href="/login" className="block w-full text-center py-4 border-2 border-black/10 hover:border-black/20 text-[#1A1A2E] rounded-2xl font-bold text-[15px] transition-colors">
            Sign in
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
