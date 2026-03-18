"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, AlertTriangle, Lightbulb, RefreshCw, BarChart, Brain, ArrowRight, ShieldCheck, Sparkles, Info } from "lucide-react";
import ReactMarkdown from "react-markdown";

type PredictionType = {
  _id: string;
  date: string;
  predictedScore: number;
  confidence: string;
  weakTopics: string[];
  recommendations: string[];
};

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<PredictionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const res = await fetch("/api/predictions");
      if (res.ok) {
        const data = await res.json();
        setPredictions(data.predictions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const generatePrediction = async () => {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/predictions", { method: "POST" });
      const data = await res.json();
      
      if (res.ok) {
        setPredictions([data.prediction, ...predictions]);
      } else {
        setError(data.message || "Failed to generate prediction.");
      }
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <SkeletonPredictions />;

  const latest = predictions[0];

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24 px-2 overflow-hidden text-white">
      <header className="px-2 space-y-2">
        <div className="flex items-center space-x-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">
           <div className="w-8 h-[1px] bg-indigo-500/30"></div>
           <Target className="w-3 h-3" />
           <span>Performance Analytics</span>
        </div>
        <h1 className="text-5xl font-black text-white tracking-tight leading-none italic">
          Academic <span className="text-indigo-500">Predictions</span>
        </h1>
        <p className="text-gray-500 text-sm font-medium tracking-wide max-w-lg">
          AI-powered trajectory mapping based on your behavior and progress.
        </p>
      </header>

      <div className="flex justify-end px-2">
        <button 
          onClick={generatePrediction} 
          disabled={generating}
          className="group relative flex items-center justify-center space-x-4 px-12 py-5 bg-white text-gray-950 font-black uppercase tracking-[0.2em] rounded-[24px] transition-all hover:bg-indigo-600 hover:text-white active:scale-95 disabled:opacity-20 shadow-2xl text-xs overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <RefreshCw className={`w-4 h-4 relative z-10 ${generating ? "animate-spin" : ""}`} />
          <span className="relative z-10">{generating ? "Re-Calibrating..." : "Execute Analysis"}</span>
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-red-500/10 border border-red-500/20 text-red-400 p-8 rounded-[32px] text-center text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-4 shadow-2xl backdrop-blur-md">
             <AlertTriangle className="w-5 h-5" />
             <span>Error: {error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {latest ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Score Card */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-4 p-12 bg-white/[0.03] border border-white/[0.05] rounded-[56px] backdrop-blur-3xl flex flex-col items-center justify-center text-center shadow-3xl relative overflow-hidden group">
             <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-600 to-transparent"></div>
             
             <div className="p-8 bg-indigo-600/10 rounded-[40px] mb-10 border border-indigo-500/10 shadow-inner group-hover:scale-110 group-hover:bg-indigo-600/20 transition-all duration-700">
                <Brain className="w-16 h-16 text-indigo-400" />
             </div>
             
             <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] mb-8">Probability Factor</h3>
             
             <div className="relative isolate">
                <div className="absolute -inset-10 bg-indigo-600/20 blur-[80px] -z-10 rounded-full opacity-50"></div>
                <div className="text-[12rem] font-black text-white tracking-tighter leading-none flex items-baseline">
                   {latest.predictedScore}
                   <span className="text-4xl text-indigo-600/60 font-light ml-4">%</span>
                </div>
             </div>

             <div className={`mt-14 flex items-center space-x-4 px-10 py-4 rounded-[24px] border text-[10px] font-black uppercase tracking-[0.3em] transition-all ${
                latest.confidence === 'High' ? 'bg-indigo-600 text-white border-transparent shadow-2xl shadow-indigo-600/40' : 
                latest.confidence === 'Medium' ? 'bg-white/10 text-white border-white/10' : 
                'bg-rose-500/10 text-rose-400 border-rose-500/20'
             }`}>
                <ShieldCheck className="w-5 h-5" />
                <span>Stability: {latest.confidence}</span>
             </div>
             
             <div className="mt-12 flex flex-col items-center space-y-2">
                <span className="text-[9px] text-gray-700 font-black uppercase tracking-[0.4em] italic leading-none">Last Updated</span>
                <span className="text-xs font-black text-gray-400 tracking-widest">{new Date(latest.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
             </div>
          </motion.div>

          {/* Details Section */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-8 space-y-10">
            {/* Weak Topics */}
            <div className="p-10 md:p-14 bg-white/[0.03] border border-white/[0.05] rounded-[56px] backdrop-blur-3xl group relative overflow-hidden shadow-3xl">
               <div className="absolute top-0 right-[-10%] w-64 h-64 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none"></div>
               <div className="flex items-center space-x-6 mb-12 relative z-10">
                  <div className="p-5 bg-rose-500/10 rounded-3xl border border-rose-500/10">
                    <AlertTriangle className="w-8 h-8 text-rose-400" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white tracking-tight">Focus Areas</h3>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mt-1.5">Topics Needing Improvement</p>
                  </div>
               </div>
               
               <div className="flex flex-wrap gap-4 relative z-10">
                {latest.weakTopics.map((topic, i) => (
                  <motion.span 
                    key={topic} 
                    whileHover={{ scale: 1.05, y: -2, backgroundColor: "rgba(244, 63, 94, 0.1)", borderColor: "rgba(244, 63, 94, 0.3)", color: "rgb(251, 113, 133)" }}
                    className="px-8 py-4 bg-white/[0.04] border border-white/5 text-gray-400 rounded-3xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl cursor-default"
                  >
                    {topic}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-10 md:p-14 bg-white/[0.03] border border-white/[0.05] rounded-[56px] backdrop-blur-3xl group relative overflow-hidden shadow-3xl">
               <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                  <Lightbulb className="w-64 h-64 text-yellow-400" />
               </div>
               <div className="flex items-center space-x-6 mb-12 relative z-10">
                  <div className="p-5 bg-indigo-600/10 rounded-3xl border border-indigo-500/10">
                    <Sparkles className="w-8 h-8 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white tracking-tight">Improvement Plan</h3>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mt-1.5">AI-Calculated Recovery Steps</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                {latest.recommendations.map((rec, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ y: -8, backgroundColor: "rgba(255, 255, 255, 0.05)", borderColor: "rgba(99, 102, 241, 0.2)" }}
                    className="flex flex-col space-y-6 bg-white/[0.02] p-10 rounded-[48px] border border-white/5 transition-all group/item shadow-inner"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/10 flex items-center justify-center text-xs font-black text-indigo-400 shadow-xl group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="text-gray-400 font-medium leading-relaxed text-sm group-hover/item:text-white transition-colors">
                       <div className="prose prose-invert max-w-none prose-p:leading-relaxed">
                          <ReactMarkdown>{rec}</ReactMarkdown>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-48 bg-white/[0.02] border border-white/[0.05] rounded-[64px] backdrop-blur-sm flex flex-col items-center shadow-3xl overflow-hidden relative group">
           <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
           <div className="w-32 h-32 bg-white/[0.03] rounded-[48px] flex items-center justify-center mb-12 group-hover:rotate-12 transition-transform duration-700">
              <BarChart className="w-16 h-16 text-gray-800 opacity-30" />
           </div>
           <h3 className="text-3xl font-black text-white mb-6 tracking-tight italic">Not Enough Data</h3>
           <p className="text-[12px] font-black text-gray-600 max-w-sm mx-auto leading-relaxed uppercase tracking-[0.5em] opacity-60 px-8">Track more study milestones to generate an accurate prediction.</p>
        </motion.div>
      )}
      
      <footer className="pt-12 border-t border-white/5 opacity-50 text-center">
         <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.6em] mb-4">
            AI Academic Assistant Premium
         </p>
      </footer>
    </div>
  );
}

function SkeletonPredictions() {
    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-pulse px-2">
            <div className="h-28 bg-white/5 rounded-[40px] w-2/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="h-[550px] bg-white/5 rounded-[56px]"></div>
                <div className="lg:col-span-2 space-y-10">
                    <div className="h-64 bg-white/5 rounded-[56px]"></div>
                    <div className="h-[400px] bg-white/5 rounded-[56px]"></div>
                </div>
            </div>
        </div>
    );
}
