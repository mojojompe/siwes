"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Loader2, Shield, Lock, Eye, EyeOff } from "lucide-react";

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

export default function PrivacyPage() {
  const router = useRouter();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updateType: "password", currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage("Password successfully updated. Your account is secure.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to update password");
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
        <h1 className="heading-display text-[22px] text-[#1A1A2E]">Privacy & Security</h1>
      </motion.header>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ...spring }} className="glass-card rounded-[1.75rem] p-6">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-black/5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <Shield className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-[#1A1A2E]">Change Password</h2>
            <p className="text-[12px] text-black/50 font-medium">Keep your account secure</p>
          </div>
        </div>

        {message && <div className="mb-5 p-4 bg-emerald-50 text-emerald-600 text-[13px] font-bold rounded-xl border border-emerald-100">{message}</div>}
        {error && <div className="mb-5 p-4 bg-red-50 text-red-600 text-[13px] font-bold rounded-xl border border-red-100">{error}</div>}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-black/40 uppercase tracking-wider mb-1.5 ml-1">Current Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black/30" />
              <input type={showCurrent ? "text" : "password"} required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full pl-10 pr-10 py-3.5 input-premium text-[14px] font-medium" />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-black/40 uppercase tracking-wider mb-1.5 ml-1">New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black/30" />
              <input type={showNew ? "text" : "password"} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full pl-10 pr-10 py-3.5 input-premium text-[14px] font-medium" />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <motion.button type="submit" disabled={saving} whileTap={{ scale: 0.97 }} className="w-full py-4 bg-[#1A1A2E] text-white rounded-xl font-bold text-[15px] mt-4 flex justify-center items-center gap-2">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Security"}
          </motion.button>
        </form>
      </motion.div>
    </main>
  );
}
