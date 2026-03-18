"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Settings as SettingsIcon, Shield, Target, Cpu, Sparkles, Save, CheckCircle2, AlertCircle, GraduationCap, MapPin, Zap } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState({
    name: "",
    classLevel: "",
    targetExam: "",
    academicGoals: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile");
        const data = await res.json();
        if (res.ok && data.user) {
          setProfile({
            name: data.user.name || "",
            classLevel: data.user.classLevel || "",
            targetExam: data.user.targetExam || "",
            academicGoals: data.user.academicGoals || "",
          });
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        setMessage("PROFILE SAVED! ✨");
      } else {
        setMessage("PROFILE UPDATE FAILED.");
      }
    } catch (error) {
      setMessage("NETWORK ERROR.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  if (loading) return <SkeletonSettings />;

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24 px-2 text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
        <div className="space-y-1">
          <div className="flex items-center space-x-3 mb-2">
             <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
                <SettingsIcon className="w-6 h-6 text-white" />
             </div>
             <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-white tracking-tight">Profile Settings</h1>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">Your Account</span>
             </div>
          </div>
          <p className="text-gray-400 max-w-xl text-sm leading-relaxed">Update your personal details and academic goals.</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/5 rounded-[56px] p-10 md:p-16 backdrop-blur-3xl shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000 grayscale">
           <Cpu className="w-64 h-64 text-indigo-400" />
        </div>
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-600 to-transparent"></div>

        <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] ml-1">Name</label>
              <div className="relative group/input">
                 <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-indigo-400 transition-colors" />
                 <input
                   type="text"
                   value={profile.name}
                   onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                   className="w-full pl-16 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:border-indigo-500/50 transition-all font-semibold shadow-inner"
                   placeholder="Your Name"
                 />
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] ml-1">Current Grade/Year</label>
              <div className="relative group/input">
                 <GraduationCap className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/input:text-indigo-400 transition-colors" />
                 <input
                   type="text"
                   placeholder="e.g. Grade 12, MSc Physics"
                   value={profile.classLevel}
                   onChange={(e) => setProfile({ ...profile, classLevel: e.target.value })}
                   className="w-full pl-16 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:border-indigo-500/50 transition-all font-semibold shadow-inner"
                 />
              </div>
            </div>
          </div>

          <div className="space-y-4">
             <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] ml-1">Target Exam</label>
             <div className="relative group/input">
                <Target className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/input:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  placeholder="e.g. SAT, Entrance Examination 2026"
                  value={profile.targetExam}
                  onChange={(e) => setProfile({ ...profile, targetExam: e.target.value })}
                  className="w-full pl-16 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:border-indigo-500/50 transition-all font-semibold shadow-inner"
                />
             </div>
          </div>

          <div className="space-y-4">
             <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] ml-1">Academic Goals</label>
             <textarea
               rows={5}
               placeholder="What are you hoping to achieve?..."
               value={profile.academicGoals}
               onChange={(e) => setProfile({ ...profile, academicGoals: e.target.value })}
               className="w-full px-8 py-6 bg-white/5 border border-white/5 rounded-3xl text-white outline-none focus:border-indigo-500/50 transition-all font-semibold shadow-inner resize-none leading-relaxed placeholder:text-gray-800"
             />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-10 pt-10 border-t border-white/5">
            <div className="flex items-center space-x-6">
               <div className="p-4 bg-white/5 rounded-2xl">
                  <Shield className="w-6 h-6 text-gray-500" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Account Status</p>
                  <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-1">Profile Active</span>
               </div>
            </div>
            
            <div className="flex items-center gap-6 w-full md:w-auto">
               <AnimatePresence>
                  {message && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest ${message.includes("UPDATED") ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10"} px-6 py-3 rounded-full border ${message.includes("UPDATED") ? "border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]" : "border-red-500/20"}`}
                    >
                        {message.includes("UPDATED") ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        <span>{message}</span>
                    </motion.div>
                  )}
               </AnimatePresence>

               <button
                 type="submit"
                 disabled={saving}
                 className="flex-1 md:flex-none px-12 py-5 bg-white text-gray-950 hover:bg-indigo-600 hover:text-white font-black uppercase tracking-[0.3em] rounded-[24px] active:scale-95 disabled:opacity-20 transition-all shadow-2xl text-[10px] flex items-center justify-center gap-3 border border-transparent"
               >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{saving ? "SAVING..." : "SAVE CHANGES"}</span>
               </button>
            </div>
          </div>
        </form>
      </motion.div>
      <p className="text-center text-[10px] font-black text-gray-800 uppercase tracking-[0.6em] italic opacity-50">AI Academic Assistant — Your Personalized Learning Guide v1.0</p>
    </div>
  );
}

function SkeletonSettings() {
    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-pulse px-2">
            <div className="h-32 bg-white/5 rounded-[40px] w-1/3"></div>
            <div className="h-[700px] bg-white/5 rounded-[56px] border border-white/5"></div>
        </div>
    );
}

function RefreshCw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
