"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Clock, FileCheck, Moon, TrendingUp, Calendar, ArrowRight, Save, Database, LayoutPanelTop, CheckCircle2, Info, Sparkles, SlidersHorizontal, Zap, Brain } from "lucide-react";

export default function ParametersPage() {
  const [preferences, setPreferences] = useState({
    difficulty: "Intermediate",
    learningPace: "Moderate",
    topicDepth: "Detailed",
    aiStyle: "Supportive"
  });

  const [form, setForm] = useState({
    date: new Date().toISOString().substring(0, 10),
    studyHours: "",
    sleepHours: "",
    attendancePercentage: "",
    internalMarks: "",
    practiceTestScores: "",
  });
  
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const res = await fetch("/api/parameters");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.parameters || []);
        // Get user data for preferences - usually we'd have a separate endpoint or session data
        // For now, let's assume we can fetch them or they'll be in a global state
        const userRes = await fetch("/api/user/profile"); // Hypothetical but let's try
        if (userRes.ok) {
           const userData = await userRes.json();
           if (userData.user?.preferences) setPreferences(userData.user.preferences);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSavingPrefs(true);
    try {
      const res = await fetch("/api/parameters", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences }),
      });
      if (res.ok) {
        setMessage("PREFERENCES SAVED! 🧠");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (e) {
       console.error(e);
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/api/parameters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMessage("LOG SAVED! ✨");
        setForm({ ...form, studyHours: "", sleepHours: "", attendancePercentage: "", internalMarks: "", practiceTestScores: "" });
        const resLogs = await fetch("/api/parameters");
        if (resLogs.ok) {
           const data = await resLogs.json();
           setLogs(data.parameters || []);
        }
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      setMessage("SYNC ERROR.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <SkeletonParameters />;

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24 px-2 overflow-hidden text-white">
      <header className="px-2 space-y-2">
        <div className="flex items-center space-x-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">
           <div className="w-8 h-[1px] bg-indigo-500/30"></div>
           <SlidersHorizontal className="w-3 h-3" />
           <span>Settings</span>
        </div>
        <h1 className="text-5xl font-black text-white tracking-tight leading-none italic">
          Learning <span className="text-indigo-500">Styles</span>
        </h1>
        <p className="text-gray-500 text-sm font-medium tracking-wide max-w-lg">
          Personalize your learning experience and track your study habits.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-12 space-y-10">
          {/* Study Preferences Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-10 md:p-14 bg-gradient-to-br from-indigo-600/10 to-transparent border border-white/[0.05] rounded-[56px] relative overflow-hidden shadow-3xl backdrop-blur-3xl group">
             <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
             
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                 <div className="space-y-4">
                   <span className="px-4 py-2 bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20">Study Preferences</span>
                   <h3 className="text-3xl font-black text-white tracking-tight">AI Learning Style</h3>
                   <p className="text-gray-500 text-sm max-w-sm">Choose how the AI assistant adapts to your needs.</p>
                </div>
                <button 
                  onClick={savePreferences}
                  disabled={savingPrefs}
                  className="px-10 py-5 bg-indigo-600 hover:scale-105 transition-all rounded-[24px] text-[10px] font-black uppercase tracking-widest flex items-center space-x-3 shadow-2xl shadow-indigo-600/30 disabled:opacity-50"
                >
                   <Save className="w-4 h-4" />
                   <span>{savingPrefs ? "Saving..." : "Save Preferences"}</span>
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                {[
                  { label: "Difficulty Matrix", key: "difficulty", options: ["Beginner", "Intermediate", "Advanced"], icon: LayoutPanelTop, color: "text-blue-400", bg: "bg-blue-400/10" },
                  { label: "Learning Pace", key: "learningPace", options: ["Slow", "Moderate", "Fast"], icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/10" },
                  { label: "Topic Depth", key: "topicDepth", options: ["Conceptual", "Detailed", "Comprehensive"], icon: Database, color: "text-purple-400", bg: "bg-purple-400/10" },
                  { label: "AI Response Style", key: "aiStyle", options: ["Supportive", "Challenging", "Brief"], icon: Brain, color: "text-pink-400", bg: "bg-pink-400/10" },
                ].map((pref) => (
                  <div key={pref.key} className="space-y-6 p-8 bg-white/[0.03] border border-white/5 rounded-[40px] hover:bg-white/[0.05] transition-all">
                     <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-2xl ${pref.bg}`}>
                           <pref.icon className={`w-5 h-5 ${pref.color}`} />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{pref.label}</span>
                     </div>
                     <div className="space-y-3">
                        {pref.options.map((opt) => (
                           <button 
                             key={opt}
                             onClick={() => setPreferences({ ...preferences, [pref.key]: opt })}
                             className={`w-full py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-left transition-all border ${
                                (preferences as any)[pref.key] === opt 
                                ? "bg-white text-gray-950 border-white shadow-xl" 
                                : "bg-white/5 text-gray-500 border-white/5 hover:border-white/20"
                             }`}
                           >
                              {opt}
                           </button>
                        ))}
                     </div>
                  </div>
                ))}
             </div>
          </motion.div>
        </div>

        <div className="xl:col-span-7 space-y-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-10 md:p-14 bg-white/[0.03] border border-white/[0.05] rounded-[56px] shadow-3xl backdrop-blur-3xl relative overflow-hidden group">
             <div className="flex items-center space-x-4 mb-10">
                <div className="p-4 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-600/30">
                   <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-white tracking-tight">Daily Study Log</h3>
                   <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Track your daily habits</span>
                </div>
             </div>

             <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2">Date</label>
                      <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full py-5 px-8 bg-white/5 border border-white/5 rounded-3xl text-white font-bold outline-none focus:border-indigo-500/50 transition-all shadow-inner" />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2">Attendance (%)</label>
                      <input type="number" min="0" max="100" required placeholder="85" value={form.attendancePercentage} onChange={(e) => setForm({ ...form, attendancePercentage: e.target.value })} className="w-full py-5 px-8 bg-white/5 border border-white/5 rounded-3xl text-white font-bold outline-none focus:border-indigo-500/50 transition-all shadow-inner" />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2">Study Hours</label>
                      <input type="number" step="0.5" required placeholder="5.5" value={form.studyHours} onChange={(e) => setForm({ ...form, studyHours: e.target.value })} className="w-full py-5 px-8 bg-white/5 border border-white/5 rounded-3xl text-white font-bold outline-none focus:border-indigo-500/50 transition-all shadow-inner" />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2">Sleep Hours</label>
                      <input type="number" step="0.5" required placeholder="7.5" value={form.sleepHours} onChange={(e) => setForm({ ...form, sleepHours: e.target.value })} className="w-full py-5 px-8 bg-white/5 border border-white/5 rounded-3xl text-white font-bold outline-none focus:border-indigo-500/50 transition-all shadow-inner" />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2">Class Grade (%)</label>
                      <input type="number" required placeholder="75" value={form.internalMarks} onChange={(e) => setForm({ ...form, internalMarks: e.target.value })} className="w-full py-5 px-8 bg-white/5 border border-white/5 rounded-3xl text-white font-bold outline-none focus:border-indigo-500/50 transition-all shadow-inner" />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-2">Practice Score (%)</label>
                      <input type="number" required placeholder="90" value={form.practiceTestScores} onChange={(e) => setForm({ ...form, practiceTestScores: e.target.value })} className="w-full py-5 px-8 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl text-white text-3xl font-black text-center outline-none focus:border-indigo-500 transition-all shadow-xl" />
                   </div>
                </div>

                <button type="submit" disabled={submitting} className="w-full py-6 bg-white text-gray-950 font-black uppercase tracking-[0.4em] rounded-[32px] text-xs transition-all hover:bg-indigo-600 hover:text-white shadow-3xl shadow-indigo-600/10 active:scale-95 disabled:opacity-50">
                   {submitting ? "SAVING LOG..." : "SAVE DAILY LOG"}
                </button>
             </form>

             <AnimatePresence>
                {message && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-8 p-4 bg-indigo-600/10 border border-indigo-500/10 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center justify-center space-x-3">
                     <Sparkles className="w-3 h-3 animate-pulse" />
                     <span>{message}</span>
                  </motion.div>
                )}
             </AnimatePresence>
          </motion.div>
        </div>

        <div className="xl:col-span-5 space-y-10">
           <div className="p-10 bg-white/[0.03] border border-white/[0.05] rounded-[56px] shadow-3xl backdrop-blur-3xl h-full flex flex-col">
              <div className="flex items-center justify-between mb-10 px-2 shrink-0">
                 <div className="space-y-1">
                    <h3 className="font-black text-white text-lg tracking-tight">Past Logs</h3>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest opacity-60">Your Study History</p>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
                 {logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center">
                       <Database className="w-16 h-16 mb-6" />
                       <p className="text-[10px] font-black uppercase tracking-widest">No Logged Data</p>
                    </div>
                 ) : (
                    logs.map((log) => (
                       <motion.div 
                         initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                         key={log._id}
                         className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] transition-all group"
                       >
                          <div className="flex justify-between items-center mb-4">
                             <span className="text-xs font-black text-white uppercase tracking-widest">{new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                             <div className="px-3 py-1 bg-indigo-600/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400">{log.practiceTestScores}%</div>
                          </div>
                          <div className="flex items-center space-x-6 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                             <div className="flex items-center space-x-2"><Clock className="w-3 h-3" /> <span>{log.studyHours}h Study</span></div>
                             <div className="flex items-center space-x-2"><Moon className="w-3 h-3" /> <span>{log.sleepHours}h Sleep</span></div>
                          </div>
                       </motion.div>
                    ))
                 )}
              </div>
           </div>
        </div>
      </div>
      
      <footer className="pt-12 border-t border-white/5 opacity-50 text-center">
         <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.6em]">
            AI Academic Assistant Premium v2.4
         </p>
      </footer>
    </div>
  );
}

function SkeletonParameters() {
    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-pulse px-2">
            <div className="h-32 bg-white/5 rounded-[40px] w-2/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                <div className="lg:col-span-3 h-[700px] bg-white/5 rounded-[56px]"></div>
                <div className="lg:col-span-2 space-y-8">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-28 bg-white/5 rounded-[32px]"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
