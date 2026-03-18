"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Target, BookOpen, Clock, Brain, ArrowRight, TrendingUp, Sparkles, LayoutDashboard, Database, Activity, Target as TargetIcon } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { data: session } = useSession();
  const [streak, setStreak] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [latestPrediction, setLatestPrediction] = useState<any>(null);
  const [params, setParams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [marking, setMarking] = useState(false);
  const [markMessage, setMarkMessage] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/streak").then(r => r.json()),
      fetch("/api/subjects").then(r => r.json()),
      fetch("/api/predictions").then(r => r.json()),
      fetch("/api/parameters").then(r => r.json()),
    ]).then(([s, sub, pred, pm]) => {
      setStreak(s.streak);
      setSubjects(sub.subjects || []);
      setLatestPrediction((pred.predictions || [])[0] || null);
      setParams(pm.parameters || []);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const markToday = async () => {
    setMarking(true);
    try {
      const res = await fetch("/api/streak", { method: "POST" });
      const data = await res.json();
      setStreak(data.streak);
      setMarkMessage(data.message === "Already marked today" ? "STAMPED! ✨" : "UPGRADED! 🔥");
      setTimeout(() => setMarkMessage(""), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setMarking(false);
    }
  };

  const totalTopics = subjects.reduce((acc: number, s: any) => acc + s.topics.length, 0);
  const completedTopics = subjects.reduce((acc: number, s: any) => acc + s.topics.filter((t: any) => t.isCompleted).length, 0);
  const overallProgress = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);
  const weeklyHours = params.slice(0, 7).reduce((acc: number, p: any) => acc + (p.studyHours || 0), 0);

  const totalTasks = params.reduce((acc: number, p: any) => acc + (p.tasksCompleted || 0), 0);
  const totalAI = params.reduce((acc: number, p: any) => acc + (p.aiInteractions || 0), 0);
  const totalDocs = params.reduce((acc: number, p: any) => acc + (p.documentCount || 0), 0);

  const stats = [
    { label: "Study Streak", value: streak ? `${streak.currentStreak || 0} Days` : "0 Days", icon: Flame, color: "text-orange-400", bg: "bg-orange-500/10", href: "/dashboard/streak" },
    { label: "Segments Learned", value: totalTasks, icon: BookOpen, color: "text-indigo-400", bg: "bg-indigo-500/10", href: "/dashboard/subjects" },
    { label: "AI Interactions", value: totalAI, icon: Sparkles, color: "text-purple-400", bg: "bg-purple-500/10", href: "/dashboard/assistant" },
    { label: "Academic Vault", value: totalDocs, icon: Database, color: "text-emerald-400", bg: "bg-emerald-500/10", href: "/dashboard/documents" },
  ];

  const quickLinks = [
    { label: "AI Tutor", desc: "Interactive Doubt Solving", href: "/dashboard/assistant", color: "from-indigo-600/20 to-purple-600/20", icon: Brain, border: "border-indigo-500/30" },
    { label: "Run Quiz", desc: "AI Powered Diagnostics", href: "/dashboard/quiz", color: "from-blue-600/20 to-cyan-600/20", icon: Sparkles, border: "border-blue-500/30" },
    { label: "Study Plan", desc: "Optimize Learning Cycle", href: "/dashboard/study-plan", color: "from-emerald-600/20 to-teal-600/20", icon: LayoutDashboard, border: "border-emerald-500/30" },
    { label: "Library", desc: "PDF Knowledge Hub", href: "/dashboard/documents", color: "from-pink-600/20 to-rose-600/20", icon: Database, border: "border-pink-500/30" },
  ];

  if (loading) return <SkeletonDashboard />;

  return (
    <>
      <header className="px-1 space-y-1">
        <div className="flex items-center space-x-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">
           <div className="w-8 h-[1px] bg-indigo-500/30"></div>
           <Sparkles className="w-3 h-3" />
           <span>Ready to Learn</span>
        </div>
        <h1 className="text-3xl md:text-4xl xl:text-5xl font-black text-white tracking-tight leading-none">
          Welcome back, <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            {session?.user?.name?.split(" ")[0] || "Scholar"}
          </span>
        </h1>
        <p className="text-gray-500 text-xs md:text-sm font-medium tracking-wide max-w-lg">
          We are currently tracking your progress across {subjects.length} active subjects.
        </p>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }} 
            key={stat.label}
          >
            <Link href={stat.href} className="flex flex-col p-6 xl:p-8 rounded-[32px] xl:rounded-[40px] bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] hover:border-indigo-500/30 transition-all group relative overflow-hidden shadow-2xl backdrop-blur-md">
               <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-150 group-hover:rotate-12 transition-transform duration-700">
                  <stat.icon className="w-16 h-16 text-white" />
               </div>
               <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4 ring-1 ring-white/10 group-hover:scale-110 transition-transform`}>
                 <stat.icon className={`w-5 h-5 ${stat.color}`} />
               </div>
               <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
               <h3 className="text-2xl xl:text-3xl font-black text-white tracking-tighter">{stat.value}</h3>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        <div className="lg:col-span-8 space-y-6 md:space-y-10">
          {/* Progress Card */}
          {totalTopics > 0 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-8 md:p-12 bg-gradient-to-br from-indigo-600/10 to-transparent border border-white/[0.05] rounded-[48px] overflow-hidden relative shadow-3xl backdrop-blur-xl group">
               <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-indigo-500/20 transition-colors"></div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
                <div className="space-y-3">
                   <span className="px-3 py-1.5 bg-indigo-500/10 text-indigo-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20">Learning Progress</span>
                   <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">Curriculum Completion</h3>
                   <p className="text-gray-500 text-xs max-w-sm">Track your overall progress across all active subjects.</p>
                </div>
                <div className="text-right flex items-baseline gap-2">
                    <span className="text-5xl md:text-6xl xl:text-7xl font-black text-white tracking-tighter">{overallProgress}</span>
                    <span className="text-xl font-bold text-indigo-500">%</span>
                </div>
              </div>

              <div className="mt-8 xl:mt-12 relative">
                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                  <motion.div
                     initial={{ width: 0 }} animate={{ width: `${overallProgress}%` }}
                     transition={{ duration: 2.5, ease: "circOut" }}
                     className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-[0_0_30px_rgba(79,70,229,0.4)] rounded-full relative"
                  >
                    <div className="absolute top-0 right-0 w-8 h-full bg-white/20 blur-sm"></div>
                  </motion.div>
                </div>
                <div className="mt-6 flex justify-between text-[9px] font-black text-gray-600 uppercase tracking-widest px-1">
                   <span>Started</span>
                   <span className="text-indigo-400/60">{completedTopics} / {totalTopics} Topics Completed</span>
                   <span>Mastered</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* AI Prediction Card */}
          {latestPrediction ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-10 md:p-14 bg-white/[0.03] border border-white/[0.05] rounded-[56px] group shadow-3xl relative overflow-hidden backdrop-blur-2xl">
               <div className="absolute top-0 right-0 p-16 opacity-5 rotate-12 group-hover:scale-110 transition-transform">
                  <Brain className="w-64 h-64 text-white" />
               </div>
              <div className="flex items-start justify-between mb-12 relative z-10">
                <div className="space-y-2">
                   <div className="flex items-center space-x-3 mb-4">
                      <div className="p-3 bg-indigo-600 shadow-xl shadow-indigo-600/30 rounded-2xl">
                         <Brain className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI Forecast</span>
                   </div>
                   <h3 className="text-3xl font-black text-white tracking-tight">Predicted Grade</h3>
                </div>
                <Link href="/dashboard/predictions" className="p-5 bg-white/5 hover:bg-indigo-600 rounded-3xl transition-all border border-white/5 group-hover:rotate-6 shadow-xl">
                  <ArrowRight className="w-6 h-6 text-white" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 items-center">
                 <div className="flex flex-col sm:flex-row items-baseline gap-4">
                    <span className="text-7xl md:text-8xl font-black text-white tracking-tighter">{latestPrediction.predictedScore}%</span>
                    <div className="flex flex-col justify-end pb-2">
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest inline-block mb-1 ${
                         latestPrediction.confidence === 'High' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                       }`}>
                          {latestPrediction.confidence} Confidence
                       </span>
                       <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Success Metric</span>
                    </div>
                 </div>
                 
                 <div className="space-y-6">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-white/5 pb-4">Areas to Improve</p>
                    <div className="flex flex-wrap gap-2">
                      {latestPrediction.weakTopics.slice(0, 4).map((t: string, i: number) => (
                        <span key={i} className="px-5 py-2.5 bg-white/5 border border-white/5 text-gray-400 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:border-indigo-500/50 transition-colors">
                           {t}
                        </span>
                      ))}
                    </div>
                 </div>
              </div>
            </motion.div>
          ) : (
            <div className="p-16 bg-white/[0.01] border-2 border-dashed border-white/5 rounded-[56px] text-center group">
              <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-indigo-500/10 opacity-60">
                 <TrendingUp className="w-10 h-10 text-indigo-400" />
              </div>
              <h4 className="text-2xl font-black text-white mb-3 tracking-tight">Not Enough Data</h4>
              <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest max-w-sm mx-auto mb-10 opacity-60">Complete more topics to generate an accurate grade prediction.</p>
              <Link href="/dashboard/predictions" className="inline-flex items-center space-x-4 px-10 py-5 bg-indigo-600 hover:scale-105 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all shadow-3xl shadow-indigo-600/30">
                <span>View Insights</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {quickLinks.map((ql, i) => (
              <Link key={i} href={ql.href} className={`p-8 rounded-[40px] bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-indigo-500/30 transition-all group flex flex-col items-center text-center shadow-xl backdrop-blur-md`}>
                <div className={`p-4 rounded-2xl bg-indigo-600 mb-6 shadow-2xl shadow-indigo-600/20 group-hover:scale-110 group-hover:-rotate-3 transition-transform`}>
                    <ql.icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-black text-white text-[10px] uppercase tracking-widest mb-1">{ql.label}</h4>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter opacity-60">{ql.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-10">
          <div className="p-10 bg-white/[0.03] border border-white/[0.05] rounded-[56px] shadow-3xl backdrop-blur-3xl relative overflow-hidden group h-full max-h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-10 px-2 shrink-0">
               <div className="space-y-1">
                  <h3 className="font-black text-white text-lg tracking-tight">Your Subjects</h3>
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest opacity-60">Active Trackers</p>
               </div>
               <Link href="/dashboard/subjects" className="p-3 bg-white/5 rounded-2xl hover:bg-indigo-600 transition-all border border-white/5 shadow-inner">
                  <ArrowRight className="w-5 h-5 text-white" />
               </Link>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-8 px-2 custom-scrollbar pr-4">
              {subjects.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-20 text-center opacity-20">
                    <Database className="w-16 h-16 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No Active Subjects</p>
                 </div>
              ) : (
                subjects.map((sub: any) => {
                  const done = sub.topics.filter((t: any) => t.isCompleted).length;
                  const total = sub.topics.length;
                  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
                  return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={sub._id} className="group/item">
                      <div className="flex justify-between items-center mb-3 px-1">
                        <span className="text-sm text-gray-200 font-bold truncate group-hover/item:text-indigo-400 transition-colors">{sub.name}</span>
                        <span className="text-[10px] text-indigo-400 font-black tracking-widest">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/10">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.5 }} className="h-full bg-indigo-600 rounded-full" />
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            <div className="pt-8 border-t border-white/5 mt-8 shrink-0">
               <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Database</span>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{subjects.length} Active</span>
               </div>
            </div>
          </div>

          {/* Streak Card */}
          <div className="p-12 bg-gradient-to-br from-orange-600/20 to-transparent border border-orange-500/10 rounded-[56px] text-center relative overflow-hidden group shadow-3xl backdrop-blur-3xl">
            <div className="absolute top-0 right-0 p-12 opacity-5 rotate-45 group-hover:scale-125 transition-transform duration-1000">
               <Flame className="w-64 h-64 text-orange-500" />
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="text-8xl font-black text-white tracking-tighter mb-2 group-hover:scale-110 transition-transform">
                 {streak?.currentStreak || 0}
              </div>
              <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.5em] mb-10">Day Streak 🔥</p>
              
              <button 
                onClick={(e) => { e.preventDefault(); markToday(); }}
                disabled={marking}
                className={`w-full py-5 rounded-3xl font-black text-[10px] tracking-widest uppercase transition-all duration-300 border active:scale-95 disabled:opacity-50 shadow-2xl ${markMessage ? 'bg-orange-600 text-white border-transparent' : 'bg-white/5 hover:bg-orange-500/20 text-orange-400 border-white/10'}`}
              >
                {marking ? "Processing..." : markMessage || "Verify Attendance"}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="pt-12 border-t border-white/5 opacity-50 text-center">
         <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.6em] mb-2">
            AI Academic Assistant Premium
         </p>
      </footer>
    </>
  );
}

function SkeletonDashboard() {
  return (
    <div className="space-y-12 animate-pulse px-2">
       <header>
          <div className="h-14 bg-white/5 rounded-3xl w-80 mb-6"></div>
          <div className="h-4 bg-white/5 rounded-2xl w-[400px]"></div>
       </header>
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
             <div key={i} className="h-48 bg-white/5 rounded-[32px] border border-white/5"></div>
          ))}
       </div>
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
             <div className="h-64 bg-white/5 rounded-[48px] border border-white/5"></div>
             <div className="h-80 bg-white/5 rounded-[48px] border border-white/5"></div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                   <div key={i} className="h-40 bg-white/5 rounded-[40px] border border-white/5"></div>
                ))}
             </div>
          </div>
          <div className="space-y-8">
             <div className="h-[500px] bg-white/5 rounded-[56px] border border-white/5"></div>
             <div className="h-72 bg-white/5 rounded-[64px] border border-white/5"></div>
          </div>
       </div>
    </div>
  );
}
