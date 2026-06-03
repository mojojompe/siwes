"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { User, LogOut, Settings, Bell, Shield, Hash, BookOpen, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  if (!session?.user) return null;

  const user = session.user as any;
  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

  return (
    <main className="p-4 sm:p-8 flex-1">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-800">Profile</h1>
      </header>

      <div className="space-y-6">
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg shadow-blue-500/30 mb-4">
            {initials || <User className="w-10 h-10" />}
          </div>
          <h2 className="text-xl font-extrabold text-slate-800">{user.firstName} {user.lastName}</h2>
          <p className="text-slate-500 font-medium text-sm mt-1">{user.department}</p>
        </div>

        {/* Info List */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="p-4 border-b border-white/50 flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-700 font-medium">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Hash className="w-4 h-4" />
              </div>
              <span>Matric Number</span>
            </div>
            <span className="text-sm font-bold text-slate-800">{user.matricNumber}</span>
          </div>
          <div className="p-4 border-b border-white/50 flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-700 font-medium">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <span>Department</span>
            </div>
            <span className="text-sm font-bold text-slate-800">{user.department}</span>
          </div>
        </div>

        {/* Settings Links */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <button onClick={() => alert("Feature coming soon!")} className="w-full p-4 border-b border-white/50 flex items-center justify-between hover:bg-white/40 transition-colors">
            <div className="flex items-center gap-3 text-slate-700 font-medium">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <Settings className="w-4 h-4" />
              </div>
              <span>Account Settings</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
          <button onClick={() => alert("Feature coming soon!")} className="w-full p-4 border-b border-white/50 flex items-center justify-between hover:bg-white/40 transition-colors">
            <div className="flex items-center gap-3 text-slate-700 font-medium">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <span>Notifications</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
          <button onClick={() => alert("Feature coming soon!")} className="w-full p-4 flex items-center justify-between hover:bg-white/40 transition-colors">
            <div className="flex items-center gap-3 text-slate-700 font-medium">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <span>Privacy & Security</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={() => setShowLogout(true)}
          className="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-3xl font-bold flex items-center justify-center gap-2 transition-colors border border-red-100"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>

        {/* Sponsor Text */}
        <div className="text-center pt-8 pb-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Sponsored by <span className="text-blue-600">Waltik Labs</span>
          </p>
        </div>
      </div>

      <AnimatePresence>
        {showLogout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-white/80 backdrop-blur-2xl w-full max-w-sm rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white overflow-hidden p-6 text-center"
            >
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Ready to leave?</h2>
              <p className="text-slate-500 mb-6 text-sm">
                Are you sure you want to log out of your account?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogout(false)}
                  className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-md shadow-red-500/20 transition-colors"
                >
                  Log Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
