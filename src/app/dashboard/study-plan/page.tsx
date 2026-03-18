"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, RefreshCw, Info, LayoutDashboard, Sparkles, BookOpen, Timer, ListChecks, CheckCircle2, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function StudyPlanPage() {
  const [plan, setPlan] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [planType, setPlanType] = useState<"daily" | "weekly">("weekly");
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  useEffect(() => {
    fetchLatestPlan();
  }, []);

  const fetchLatestPlan = async () => {
    try {
      const res = await fetch("/api/study-plan");
      if (res.ok) {
        const data = await res.json();
        setPlan(data.plan || []);
        setPlanType(data.type || "weekly");
        if (data.createdAt) setLastGenerated(new Date(data.createdAt).toLocaleString());
      }
    } catch (err) {
      console.error("Failed to fetch plan", err);
    } finally {
      setFetching(false);
    }
  };

  const generatePlan = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: planType }),
      });

      if (res.ok) {
        const data = await res.json();
        setPlan(data.plan || []);
        setLastGenerated(new Date().toLocaleString());
      }
    } catch (err) {
      console.error("Failed to generate plan", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (index: number) => {
    const newPlan = [...plan];
    newPlan[index].isCompleted = !newPlan[index].isCompleted;
    setPlan(newPlan);

    try {
      await fetch("/api/study-plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: newPlan, type: planType }),
      });
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  const progress = plan.length > 0 
    ? (plan.filter(p => p.isCompleted).length / plan.length) * 100 
    : 0;

  if (fetching) return <SkeletonStudyPlan />;

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24 px-2 overflow-hidden text-white">
      <header className="px-2 space-y-2">
        <div className="flex items-center space-x-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">
           <div className="w-8 h-[1px] bg-indigo-500/30"></div>
           <Calendar className="w-3 h-3" />
           <span>Study Schedule</span>
        </div>
        <h1 className="text-5xl font-black text-white tracking-tight leading-none italic">
          Study <span className="text-indigo-500">Plan</span>
        </h1>
        <p className="text-gray-500 text-sm font-medium tracking-wide max-w-lg">
          Smart scheduling optimized for your learning habits.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 px-2">
            <div className="flex items-center space-x-6 bg-white/[0.03] border border-white/5 p-2 rounded-[28px] shadow-inner">
               {["daily", "weekly"].map((type) => (
                 <button 
                  key={type}
                  onClick={() => setPlanType(type as any)}
                  className={`px-8 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-wider transition-all ${
                    planType === type ? "bg-white text-gray-950 shadow-xl" : "text-gray-500 hover:text-white"
                  }`}
                 >
                   {type} Plan
                 </button>
               ))}
            </div>

            <button 
              onClick={generatePlan} 
              disabled={loading}
              className="flex items-center justify-center space-x-4 px-12 py-5 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-[24px] shadow-2xl shadow-indigo-600/30 active:scale-95 disabled:opacity-20 transition-all hover:bg-indigo-700 text-xs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Generating..." : "Generate Plan"}</span>
            </button>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.5em]">Your Schedule</h3>
               {lastGenerated && (
                 <div className="px-4 py-2 bg-indigo-600/10 rounded-full text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center border border-indigo-500/10">
                    <Sparkles className="w-3 h-3 mr-2 animate-pulse" /> Generated: {lastGenerated}
                 </div>
               )}
            </div>

            <div className="bg-white/[0.03] border border-white/[0.05] rounded-[56px] p-10 md:p-14 min-h-[500px] backdrop-blur-3xl shadow-3xl relative overflow-hidden group">
               <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-600 to-transparent opacity-20"></div>
               
               {plan.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-40 opacity-20 text-center">
                    <Calendar className="w-20 h-20 mb-8" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No Plan Generated</p>
                 </div>
               ) : (
                 <div className="space-y-6">
                    {plan.map((item, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: -20 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: i * 0.05 }}
                        className={`p-10 rounded-[44px] border transition-all cursor-pointer group/item relative overflow-hidden ${
                          item.isCompleted 
                          ? "bg-emerald-500/5 border-emerald-500/20 opacity-60" 
                          : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-indigo-500/30"
                        }`}
                        onClick={() => toggleTask(i)}
                      >
                         <div className={`absolute top-0 left-0 w-2 h-full transition-all ${item.isCompleted ? "bg-emerald-500" : "bg-indigo-600 opacity-0 group-hover/item:opacity-40"}`}></div>
                         
                         <div className="flex items-center space-x-10">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-inner ${
                              item.isCompleted ? "bg-emerald-500 text-white" : "bg-white/5 text-gray-600 group-hover/item:bg-indigo-600 group-hover/item:text-white"
                            }`}>
                               {item.isCompleted ? <CheckCircle2 className="w-7 h-7" /> : <ListChecks className="w-7 h-7" />}
                            </div>
                            <div className="flex-1">
                               <div className="flex items-center space-x-4 mb-3">
                                  <span className={`text-[10px] font-black uppercase tracking-widest ${item.isCompleted ? "text-emerald-400" : "text-indigo-400"}`}>
                                     {item.time || item.day}
                                  </span>
                               </div>
                               <div className={`text-xl font-bold tracking-tight leading-relaxed ${item.isCompleted ? "text-gray-500 line-through" : "text-gray-200"}`}>
                                  <ReactMarkdown>{item.task}</ReactMarkdown>
                               </div>
                            </div>
                         </div>
                      </motion.div>
                    ))}
                 </div>
               )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
           {/* Progress Card */}
           <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-12 bg-white/[0.03] border border-white/[0.05] rounded-[56px] shadow-3xl backdrop-blur-3xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-20"></div>
              <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.5em] mb-10 text-center">Completion Rate</h3>
              
              <div className="relative flex items-center justify-center mb-10">
                 <div className="text-[8rem] font-black text-white tracking-tighter leading-none italic">
                   {Math.round(progress)}
                   <span className="text-2xl text-emerald-500/50 font-light ml-2">%</span>
                 </div>
              </div>

              <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden mb-8 border border-white/5 p-1">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                 />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white/5 p-6 rounded-3xl text-center">
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Total</p>
                    <p className="text-2xl font-black text-white">{plan.length}</p>
                 </div>
                 <div className="bg-emerald-500/10 p-6 rounded-3xl text-center border border-emerald-500/10">
                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Completed</p>
                    <p className="text-2xl font-black text-emerald-400">{plan.filter(p => p.isCompleted).length}</p>
                 </div>
              </div>
           </motion.div>

           <div className="p-10 bg-indigo-600/10 border border-indigo-500/10 rounded-[56px] shadow-inner flex flex-col items-center text-center space-y-6">
              <div className="p-4 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/30">
                 <Brain className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-black text-white tracking-tight uppercase">Pro Tip</h4>
              <p className="text-gray-400 text-xs leading-relaxed italic">
                 "Consistent progress in {planType === "daily" ? "short bursts" : "weekly iterations"} builds a strong foundation. Check off each task as you go to stay on track."
              </p>
           </div>
        </div>
      </div>
      
      <footer className="pt-12 border-t border-white/5 opacity-50 text-center">
         <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.6em] mb-4">
            AI Academic Assistant Premium
         </p>
      </footer>
    </div>
  );
}

function SkeletonStudyPlan() {
    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-pulse px-2">
            <div className="flex justify-between items-end gap-10">
                <div className="h-24 bg-white/5 rounded-[32px] w-1/2"></div>
                <div className="h-16 bg-white/5 rounded-2xl w-1/4"></div>
            </div>
            <div className="h-[600px] bg-white/5 rounded-[48px]"></div>
        </div>
    );
}
