"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Loader2, User, Hash, BookOpen, Mail } from "lucide-react";

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [department, setDepartment] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [email, setEmail] = useState("");
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user) {
      const user = session.user as any;
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setDepartment(user.department || "");
      setMatricNumber(user.matricNumber || "");
      setEmail(user.email || "");
    }
  }, [session]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, department, email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Tell NextAuth to update its session with the new data
      await update({
        ...session,
        user: { ...session?.user, firstName, lastName, department, email }
      });

      setMessage("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="p-5 pb-32 flex-1 mesh-bg min-h-screen">
      <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="flex items-center gap-4 sticky top-0 z-[60] pt-5 pb-4 -mx-5 px-5 mb-8">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-black/50 border border-black/5 hover:text-black transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
        <h1 className="heading-display text-[22px] text-[#1A1A2E]">Account Settings</h1>
      </motion.header>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ...spring }} className="glass-card rounded-[1.75rem] p-6">
        {message && <div className="mb-5 p-4 bg-emerald-50 text-emerald-600 text-[13px] font-bold rounded-xl border border-emerald-100">{message}</div>}
        {error && <div className="mb-5 p-4 bg-red-50 text-red-600 text-[13px] font-bold rounded-xl border border-red-100">{error}</div>}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-black/40 uppercase tracking-wider mb-1.5 ml-1">First Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black/30" />
                <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full pl-10 pr-4 py-3.5 input-premium text-[14px] font-medium" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-black/40 uppercase tracking-wider mb-1.5 ml-1">Last Name</label>
              <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-3.5 input-premium text-[14px] font-medium" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-black/40 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-2">
              Matric Number
              <span className="text-[9px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Unchangeable</span>
            </label>
            <div className="relative opacity-60 pointer-events-none">
              <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black/30" />
              <input type="text" readOnly disabled value={matricNumber} className="w-full pl-10 pr-4 py-3.5 bg-black/5 text-[#1A1A2E] rounded-xl text-[14px] font-bold uppercase outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-black/40 uppercase tracking-wider mb-1.5 ml-1">Department / Course</label>
            <div className="relative">
              <BookOpen className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black/30" />
              <input type="text" required value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full pl-10 pr-4 py-3.5 input-premium text-[14px] font-medium" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-black/40 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black/30" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3.5 input-premium text-[14px] font-medium" />
            </div>
          </div>

          <motion.button type="submit" disabled={saving} whileTap={{ scale: 0.97 }} className="w-full py-4 btn-primary rounded-xl font-bold text-[15px] mt-4 flex justify-center items-center gap-2">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
          </motion.button>
        </form>
      </motion.div>
    </main>
  );
}
