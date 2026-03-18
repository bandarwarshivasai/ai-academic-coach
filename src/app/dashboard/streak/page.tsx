"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Trophy, Calendar, Star, CheckCircle, Zap, Timer, Award, Workflow, Activity, Sparkles, Target, ShieldCheck } from "lucide-react";

export default function StreakPage() {
  const [streak, setStreak] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { fetchStreak(); }, []);

  const fetchStreak = async () => {
    try {
        const res = await fetch("/api/streak");
        if (res.ok) { const data = await res.json(); setStreak(data.streak); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const markToday = async () => {
    setMarking(true);
    try {
        const res = await fetch("/api/streak", { method: "POST" });
        const data = await res.json();
        setStreak(data.streak);
        setMessage(data.message === "Already marked today" ? "STREAK MAINTAINED! ✨" : "STREAK UPDATED! 🔥");
        setTimeout(() => setMessage(""), 3000);
    } catch (e) {
        console.error(e);
    } finally {
        setMarking(false);
    }
  };

  if (loading) return <SkeletonStreak />;

  const stats = [
    { label: "Current Streak", value: streak?.currentStreak || 0, icon: Flame, unit: "Days", color: "text-orange-500", bg: "bg-orange-600/10", border: "border-orange-500/20" },
    { label: "Best Streak", value: streak?.longestStreak || 0, icon: Trophy, unit: "Days", color: "text-yellow-500", bg: "bg-yellow-600/10", border: "border-yellow-500/20" },
    { label: "Total Days", value: streak?.studyDates?.length || 0, icon: CheckCircle, unit: "Days", color: "text-indigo-500", bg: "bg-indigo-600/10", border: "border-indigo-500/20" },
  ];

  // Generate a heatmap-style last 30 days
  const today = new Date();
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - i));
    d.setHours(0, 0, 0, 0);
    const studied = streak?.studyDates?.some((sd: string) => {
      const dd = new Date(sd); dd.setHours(0, 0, 0, 0);
      return dd.getTime() === d.getTime();
    });
    return { date: d, studied };
  });

  const allBadges = [
    { id: "🔥 7-Day Streak", label: "7-Day Streak", icon: <Flame className="w-10 h-10" />, desc: "Study for 7 consecutive days" },
    { id: "🏆 30-Day Champion", label: "30-Day Streak", icon: <Trophy className="w-10 h-10" />, desc: "Study for 30 consecutive days" },
    { id: "📚 Consistency Champion", label: "Dedicated Learner", icon: <Timer className="w-10 h-10" />, desc: "Complete 50 total study sessions" },
    { id: "quiz-master", label: "Quiz Master", icon: <Zap className="w-10 h-10" />, desc: "Complete 10 quizzes" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 px-2 overflow-hidden text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
        <div className="space-y-1">
          <div className="flex items-center space-x-3 mb-2">
             <div className="p-3 bg-orange-600 rounded-2xl shadow-lg shadow-orange-600/20">
                <Flame className="w-6 h-6 text-white" />
             </div>
             <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-white tracking-tight">Streak</h1>
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mt-0.5">Your Study Momentum</span>
             </div>
          </div>
          <p className="text-gray-400 max-w-xl text-sm leading-relaxed">Track your daily study habits and build a consistent routine.</p>
        </div>
        <button
          onClick={markToday}
          disabled={marking}
          className="px-12 py-5 bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest rounded-[24px] transition-all shadow-2xl shadow-orange-600/30 active:scale-95 disabled:opacity-20 text-xs border border-transparent"
        >
          {marking ? "Saving..." : "Mark as Studied Today"}
        </button>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-orange-600/10 border border-orange-500/20 text-orange-400 p-6 rounded-[28px] text-center font-black uppercase tracking-widest text-[10px] flex items-center justify-center space-x-4 shadow-xl">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>{message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-10 rounded-[48px] bg-white/5 border border-white/5 flex flex-col items-center shadow-2xl backdrop-blur-3xl group relative overflow-hidden text-center">
            <div className={`w-16 h-16 rounded-[24px] ${s.bg} flex items-center justify-center mb-8 border ${s.border} shadow-inner group-hover:scale-110 transition-transform duration-700`}>
                 <s.icon className={`w-8 h-8 ${s.color}`} />
            </div>
            <div className="text-7xl font-black text-white tracking-tighter mb-2 drop-shadow-2xl">{s.value}</div>
            <p className="text-gray-600 font-black uppercase text-[10px] tracking-[0.4em]">{s.label}</p>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1 opacity-40">{s.unit}</p>
          </motion.div>
        ))}
      </div>

      {/* 30-day heatmap */}
      <div className="bg-white/5 border border-white/5 rounded-[56px] p-12 lg:p-16 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000 grayscale">
           <Activity className="w-56 h-56 text-orange-400" />
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8 relative z-10">
            <div className="flex items-center space-x-6">
               <div className="p-4 bg-white/5 rounded-2xl">
                  <Calendar className="w-6 h-6 text-gray-400" />
               </div>
               <div>
                 <h3 className="text-xl font-bold text-white tracking-tight">Study Heatmap</h3>
                 <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mt-1">Your Daily Progress</p>
               </div>
            </div>
            <div className="flex items-center space-x-6 text-[9px] font-black uppercase tracking-widest">
                <div className="flex items-center space-x-3 bg-white/2 px-4 py-2 rounded-full border border-white/5"><div className="w-2.5 h-2.5 rounded-full bg-white/5 border border-white/10 shadow-inner"></div><span className="text-gray-700">Missed</span></div>
                <div className="flex items-center space-x-3 bg-orange-600/10 px-4 py-2 rounded-full border border-orange-500/10"><div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.6)] animate-pulse"></div><span className="text-orange-500">Studied</span></div>
            </div>
        </div>
        
        <div className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-4 relative z-10">
          {last30.map((day, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.1, y: -5 }}
              title={day.date.toLocaleDateString()}
              className={`aspect-square rounded-2xl border transition-all flex items-center justify-center font-mono text-[9px] font-black cursor-default shadow-lg ${day.studied ? "bg-orange-600 border-orange-400 text-white shadow-orange-600/30 ring-2 ring-orange-500/10" : "bg-white/[0.02] border-white/5 text-gray-800"}`}
            >
               {day.date.getDate()}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="space-y-10">
        <div className="flex items-center justify-between px-4">
           <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.5em]">Achievements</h3>
           <div className="flex items-center text-[9px] font-black text-orange-400/40 uppercase tracking-widest">
              <Award className="w-3 h-3 mr-2" /> Milestones
           </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {allBadges.map((badge, i) => {
            const earned = streak?.badges?.includes(badge.id);
            return (
              <motion.div 
                key={badge.id} 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + (i * 0.05) }}
                className={`p-10 rounded-[48px] text-center border transition-all flex flex-col items-center group/badge shadow-2xl relative overflow-hidden ${earned ? "bg-white/5 border-orange-500/40" : "bg-white/[0.02] border-white/5 opacity-20 grayscale scale-95"}`}
              >
                {earned && (
                   <div className="absolute top-0 inset-x-0 h-1 bg-orange-600 shadow-[0_0_20px_rgba(234,88,12,0.8)]"></div>
                )}
                <div className={`p-6 rounded-[28px] mb-8 transition-transform duration-700 ${earned ? "bg-orange-600/10 text-orange-500 group-hover/badge:scale-110 group-hover/badge:-rotate-6" : "bg-white/2 text-gray-800"}`}>
                   {badge.icon}
                </div>
                <p className={`text-sm font-black uppercase tracking-widest mb-3 ${earned ? "text-white" : "text-gray-800"}`}>{badge.label}</p>
                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-wider leading-relaxed px-4">{badge.desc}</p>
                {earned && (
                   <div className="mt-8 px-5 py-2 bg-orange-600 text-white font-black text-[8px] uppercase tracking-[0.3em] rounded-full shadow-lg">
                      Earned
                   </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
      
      <p className="text-center text-[10px] font-black text-gray-800 uppercase tracking-[0.6em] italic opacity-50">AI Academic Assistant — Your Personalized Learning Guide v1.0</p>
    </div>
  );
}

function SkeletonStreak() {
    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-pulse px-2">
            <div className="h-32 bg-white/5 rounded-[40px] w-2/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => <div key={i} className="h-56 bg-white/5 rounded-[48px]"></div>)}
            </div>
            <div className="h-80 bg-white/5 rounded-[56px]"></div>
        </div>
    );
}
