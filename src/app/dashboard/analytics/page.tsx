"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, AreaChart, Area
} from "recharts";
import { TrendingUp, BarChart2, Activity, Calendar, Award, Database, LayoutPanelLeft, Sparkles, Target, Zap } from "lucide-react";

export default function AnalyticsPage() {
  const [params, setParams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/parameters").then(r => r.json()),
      fetch("/api/subjects").then(r => r.json()),
      fetch("/api/predictions").then(r => r.json()),
    ]).then(([p, s, pr]) => {
      setParams((p.parameters || []).slice(0, 14).reverse());
      setSubjects(s.subjects || []);
      setPredictions((pr.predictions || []).slice(0, 10).reverse());
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Shape data for charts
  const studyHoursData = params.map((p: any) => ({
    date: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    "Study Hours": p.studyHours,
    "Sleep Hours": p.sleepHours,
  }));

  const performanceData = params.map((p: any) => ({
    date: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    "Internal Marks": p.internalMarks,
    "Practice Score": p.practiceTestScores,
  }));

  const subjectRadar = subjects.map((s: any) => ({
    subject: s.name,
    completion: s.topics.length === 0 ? 0 : Math.round((s.topics.filter((t: any) => t.isCompleted).length / s.topics.length) * 100),
  }));

  const predictionLine = predictions.map((p: any) => ({
    date: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    "Predicted Score": p.predictedScore,
  }));

  const TOOLTIP_STYLE = { 
    backgroundColor: "rgba(10, 10, 20, 0.95)", 
    border: "1px solid rgba(255,255,255,0.1)", 
    borderRadius: "24px", 
    color: "#fff",
    backdropFilter: "blur(20px)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    padding: "16px"
  };

  if (loading) return <SkeletonAnalytics />;

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24 px-2 overflow-hidden text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
        <div className="space-y-1">
          <div className="flex items-center space-x-3 mb-2">
             <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
                <TrendingUp className="w-6 h-6 text-white" />
             </div>
             <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-white tracking-tight">Analytics</h1>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">Performance Metrics</span>
             </div>
          </div>
          <p className="text-gray-400 max-w-xl text-sm leading-relaxed">Visualize your behavioral trends and academic efficiency through integrated intelligence mapping.</p>
        </div>
      </div>

      {params.length === 0 && predictions.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-40 text-center bg-white/5 border border-white/5 rounded-[56px] flex flex-col items-center shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-600/30 to-transparent"></div>
          <div className="w-24 h-24 bg-white/2 rounded-[32px] flex items-center justify-center mb-10 border border-white/5 relative">
             <Database className="w-10 h-10 text-gray-800 opacity-20 group-hover:opacity-40 transition-all duration-700" />
             <div className="absolute inset-0 border-2 border-dashed border-white/5 rounded-[32px] animate-[spin_40s_linear_infinite]"></div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">No data to calculate</h3>
          <p className="text-[10px] text-gray-700 font-black uppercase tracking-[0.4em] max-w-xs mx-auto leading-relaxed">Log your study sessions daily to view your progress.</p>
        </motion.div>
      ) : (
        <div className="space-y-10">
          {/* Row 1: Study habits */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="bg-white/5 border border-white/5 rounded-[48px] p-10 md:p-14 backdrop-blur-3xl group relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 p-12 opacity-5 scale-125 grayscale group-hover:grayscale-0 transition-all duration-1000">
                  <Calendar className="w-40 h-40 text-purple-400" />
               </div>
               <div className="flex flex-col mb-10 relative z-10">
                  <h3 className="text-xl font-bold text-white tracking-tight mb-4">Behavioral Volume</h3>
                  <div className="flex items-center space-x-6 text-[9px] font-black uppercase tracking-widest">
                     <div className="flex items-center space-x-3 bg-purple-600/10 px-4 py-2 rounded-full border border-purple-500/10"><div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-lg"></div><span className="text-purple-400">Study Vectors</span></div>
                     <div className="flex items-center space-x-3 bg-indigo-600/10 px-4 py-2 rounded-full border border-indigo-500/10"><div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-lg"></div><span className="text-indigo-400">Recovery Cycles</span></div>
                  </div>
               </div>
               <ResponsiveContainer width="100%" height={300}>
                 <AreaChart data={studyHoursData}>
                   <defs>
                     <linearGradient id="colorStudy" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                       <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                     </linearGradient>
                     <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                       <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                   <XAxis dataKey="date" stroke="#4b5563" tick={{ fontSize: 9, fontWeight: 900, fill: '#4b5563' }} axisLine={false} tickLine={false} />
                   <YAxis stroke="#4b5563" tick={{ fontSize: 9, fontWeight: 900, fill: '#4b5563' }} axisLine={false} tickLine={false} />
                   <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 2 }} />
                   <Area type="monotone" dataKey="Study Hours" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorStudy)" />
                   <Area type="monotone" dataKey="Sleep Hours" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorSleep)" />
                 </AreaChart>
               </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 border border-white/5 rounded-[48px] p-10 md:p-14 backdrop-blur-3xl group relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 p-12 opacity-5 scale-125 grayscale group-hover:grayscale-0 transition-all duration-1000">
                  <Award className="w-40 h-40 text-green-400" />
               </div>
               <div className="flex flex-col mb-10 relative z-10">
                  <h3 className="text-xl font-bold text-white tracking-tight mb-4">Performance Calibration</h3>
                  <div className="flex items-center space-x-6 text-[9px] font-black uppercase tracking-widest">
                     <div className="flex items-center space-x-3 bg-emerald-600/10 px-4 py-2 rounded-full border border-emerald-500/10"><div className="w-2.5 h-2.5 rounded-2xl bg-emerald-600 shadow-lg"></div><span className="text-emerald-400">Internal Marks</span></div>
                     <div className="flex items-center space-x-3 bg-indigo-600/10 px-4 py-2 rounded-full border border-indigo-500/10"><div className="w-2.5 h-2.5 rounded-2xl bg-indigo-600 shadow-lg"></div><span className="text-indigo-400">Diagnostic Score</span></div>
                  </div>
               </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData} barGap={10}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="date" stroke="#4b5563" tick={{ fontSize: 9, fontWeight: 900, fill: '#4b5563' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#4b5563" tick={{ fontSize: 9, fontWeight: 900, fill: '#4b5563' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="Internal Marks" fill="#10b981" radius={[8, 8, 0, 0]} shadow-xl />
                  <Bar dataKey="Practice Score" fill="#6366f1" radius={[8, 8, 0, 0]} shadow-xl />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Row 2: Radar and AI Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {subjectRadar.length > 2 && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white/5 border border-white/5 rounded-[48px] p-10 md:p-14 backdrop-blur-3xl group overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 inset-x-0 h-1 bg-indigo-600 opacity-20"></div>
                <h3 className="text-xl font-bold text-white mb-10 tracking-tight">Curriculum Saturation</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={subjectRadar}>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#6b7280", fontSize: 10, fontWeight: 900 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar 
                       name="Mastery %" 
                       dataKey="completion" 
                       stroke="#6366f1" 
                       strokeWidth={4} 
                       fill="#6366f1" 
                       fillOpacity={0.3} 
                    />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </RadarChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {predictionLine.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 border border-white/5 rounded-[48px] p-10 md:p-14 backdrop-blur-3xl group overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 inset-x-0 h-1 bg-cyan-600 opacity-20"></div>
                <h3 className="text-xl font-bold text-white mb-10 tracking-tight">Predictive Trajectory</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={predictionLine}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="date" stroke="#4b5563" tick={{ fontSize: 9, fontWeight: 900, fill: '#4b5563' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#4b5563" tick={{ fontSize: 9, fontWeight: 900, fill: '#4b5563' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Line 
                       type="stepAfter" 
                       dataKey="Predicted Score" 
                       stroke="#22d3ee" 
                       strokeWidth={6} 
                       dot={{ fill: "#22d3ee", stroke: "white", strokeWidth: 3, r: 8 }} 
                       activeDot={{ r: 10, strokeWidth: 0, fill: "#fff" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </div>

          {/* Improvement Summary - The "WOW" card */}
          {predictions.length > 1 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-14 md:p-20 bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-black/80 border border-white/5 rounded-[64px] relative overflow-hidden group shadow-[0_0_80px_rgba(0,0,0,0.5)]">
              <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600 opacity-40"></div>
              <div className="absolute top-0 right-0 p-20 opacity-5 group-hover:rotate-12 group-hover:scale-110 transition-all duration-1000 grayscale group-hover:grayscale-0">
                 <Zap className="w-80 h-80 text-indigo-400" />
              </div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-16">
                 <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center shadow-2xl border border-white/5 group-hover:scale-110 transition-transform duration-700">
                    <TrendingUp className="w-16 h-16 text-indigo-400 drop-shadow-glow" />
                 </div>
                 <div className="text-center md:text-left">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.6em] mb-4">Progress Analysis</p>
                  <h3 className="text-6xl font-black text-white tracking-tighter mb-6">
                    {predictions[0].predictedScore}% <span className="text-gray-800 font-light mx-4">→</span> {predictions[predictions.length - 1].predictedScore}%
                  </h3>
                  <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-6">
                     <span className={`text-2xl font-black rounded-2xl px-6 py-2 border ${predictions[predictions.length - 1].predictedScore >= predictions[0].predictedScore ? "text-green-400 bg-green-500/10 border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.3)]" : "text-red-400 bg-red-500/10 border-red-500/20"}`}>
                        {predictions[predictions.length - 1].predictedScore >= predictions[0].predictedScore ? "+" : ""}
                        {predictions[predictions.length - 1].predictedScore - predictions[0].predictedScore}% GROWTH
                     </span>
                     <div className="hidden md:block w-[1px] h-10 bg-white/5"></div>
                     <span className="text-[10px] text-gray-700 font-black uppercase tracking-[0.4em] leading-relaxed">Cross-Validation over {predictions.length} Data Iterations</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
      
      <p className="text-center text-[10px] font-black text-gray-800 uppercase tracking-[0.6em] italic opacity-50">AI Academic Assistant — Your Personalized Learning Guide v1.0</p>
    </div>
  );
}

function SkeletonAnalytics() {
    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-pulse px-2">
            <div className="h-32 bg-white/5 rounded-[40px] w-1/2"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="h-[450px] bg-white/5 rounded-[48px]"></div>
                <div className="h-[450px] bg-white/5 rounded-[48px]"></div>
            </div>
            <div className="h-[600px] bg-white/5 rounded-[64px]"></div>
        </div>
    );
}
