"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, BookOpen, HelpCircle, CheckCircle, XCircle, RotateCcw, 
  ChevronsRight, Lightbulb, Sparkles, Trophy, BrainCircuit, Timer,
  ChevronDown, X, Info
} from "lucide-react";
import ReactMarkdown from "react-markdown";

type QuizQuestion = { question: string; options: string[]; answer: string; explanation: string };
type Flashcard = { front: string; back: string };
type ShortAnswer = { question: string; answer: string };

export default function QuizPage() {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [activeTab, setActiveTab] = useState<"mcq" | "flashcard" | "short_answer">("mcq");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [shortAnswers, setShortAnswers] = useState<ShortAnswer[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setQuestions([]); setFlashcards([]); setShortAnswers([]);
    setCurrentIdx(0); setScore(0); setShowResult(false); setFlipped(false);

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, type: activeTab, count }),
      });

      if (res.ok) {
        const data = await res.json();
        if (activeTab === "mcq") setQuestions(data.questions || []);
        else if (activeTab === "flashcard") setFlashcards(data.flashcards || []);
        else if (activeTab === "short_answer") setShortAnswers(data.questions || []);
      }
    } catch (error) {
       console.error(error);
    } finally {
      setLoading(false); setSelectedAnswer(null);
    }
  };

  const handleAnswer = (opt: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(opt);
    if (opt === questions[currentIdx]?.answer) setScore(s => s + 1);
  };

  const nextQuestion = () => {
    if (currentIdx + 1 >= questions.length) { setShowResult(true); return; }
    setCurrentIdx(i => i + 1); setSelectedAnswer(null);
  };

  const tabs = [
    { key: "mcq", label: "MCQs", icon: HelpCircle },
    { key: "flashcard", label: "Flashcards", icon: Zap },
    { key: "short_answer", label: "Q&A", icon: BookOpen },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 px-2 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
        <div className="space-y-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
               <h1 className="text-2xl font-bold text-white tracking-tight">Quizzes & Flashcards</h1>
               <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">AI Knowledge Testing</span>
            </div>
          </div>
          <p className="text-gray-400 max-w-xl text-sm leading-relaxed">Generate personalized testing materials to master any subject.</p>
        </div>
      </div>

      {/* Controls Card */}
      <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-10 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20"></div>
        
        <div className="flex flex-wrap gap-3 mb-10">
          {tabs.map(t => (
            <button 
               key={t.key} 
               onClick={() => { setActiveTab(t.key as any); setQuestions([]); setFlashcards([]); setShortAnswers([]); setShowResult(false); }} 
               className={`relative flex items-center space-x-3 px-8 py-4 rounded-[20px] font-bold transition-all border ${activeTab === t.key ? "bg-indigo-600 text-white border-transparent shadow-xl shadow-indigo-600/20" : "text-gray-500 hover:text-gray-200 border-white/5 hover:bg-white/5"}`}
            >
              <t.icon className="w-4 h-4" />
              <span className="text-sm tracking-wide">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative group">
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Enter a topic (e.g. Organic Chemistry, Real Analysis)..."
              className="w-full px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all font-semibold placeholder:text-gray-600 shadow-inner group-focus-within:bg-white/10"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-all">
               <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div className="flex items-center space-x-4 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 shadow-inner">
            <span className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">Count</span>
            <select 
              value={count} 
              onChange={e => setCount(Number(e.target.value))} 
              className="bg-transparent text-white font-bold outline-none cursor-pointer text-sm"
            >
              {[3, 5, 10, 15].map(n => <option key={n} value={n} className="bg-gray-950 font-sans">{n}</option>)}
            </select>
          </div>
          <button 
             onClick={generate} 
             disabled={loading || !topic.trim()} 
             className="px-10 py-4 bg-white text-gray-900 hover:bg-indigo-600 hover:text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl transition-all active:scale-95 disabled:opacity-20 shrink-0 text-xs"
          >
            {loading ? "Generating..." : "Generate Test"}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* MCQ Quiz View */}
        {activeTab === "mcq" && questions.length > 0 && !showResult && (
          <motion.div 
             key="mcq-quiz"
             initial={{ opacity: 0, y: 30 }} 
             animate={{ opacity: 1, y: 0 }} 
             exit={{ opacity: 0, scale: 0.95 }}
             className="bg-white/5 border border-white/10 rounded-[48px] p-10 md:p-16 relative overflow-hidden shadow-2xl"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
               <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20">
                     <span className="text-indigo-400 font-black text-xs">{currentIdx + 1}</span>
                  </div>
                  <div>
                    <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Knowledge Check</h2>
                    <p className="text-white/60 text-xs font-bold font-mono mt-1">PTR: {currentIdx + 1} / {questions.length}</p>
                  </div>
               </div>
               <div className="flex items-center space-x-3 px-6 py-3 bg-indigo-600/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/10">
                  <Trophy className="w-4 h-4" />
                  <span>Success Score: {score}</span>
               </div>
            </div>

            <div className="w-full bg-white/5 rounded-full h-1 mb-16 overflow-hidden">
              <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${((currentIdx) / questions.length) * 100}%` }} 
                 className="h-full bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.5)]" 
              />
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-white mb-12 leading-relaxed tracking-tight">{questions[currentIdx].question}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions[currentIdx].options.map((opt, i) => {
                let style = "bg-white/2 border-white/5 text-gray-400 hover:bg-white/5 hover:border-indigo-500/30";
                if (selectedAnswer) {
                  if (opt === questions[currentIdx].answer) style = "bg-indigo-600 text-white border-transparent shadow-xl shadow-indigo-600/40";
                  else if (opt === selectedAnswer) style = "bg-red-500/20 border-red-500/40 text-red-300";
                  else style = "bg-white/2 border-white/2 text-gray-700 opacity-40";
                }
                return (
                  <button 
                     key={opt} 
                     onClick={() => handleAnswer(opt)} 
                     disabled={!!selectedAnswer} 
                     className={`w-full text-left px-8 py-6 rounded-3xl border transition-all font-bold text-sm leading-relaxed ${style}`}
                  >
                    <div className="flex items-center space-x-4">
                       <span className={`w-8 h-8 rounded-xl flex items-center justify-center border font-mono text-xs ${selectedAnswer ? 'border-transparent bg-white/10' : 'border-white/10 text-gray-600'}`}>
                          {String.fromCharCode(65 + i)}
                       </span>
                       <span>{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {selectedAnswer && (
                <motion.div 
                   initial={{ opacity: 0, y: 20 }} 
                   animate={{ opacity: 1, y: 0 }}
                   className="mt-12"
                >
                  <div className="p-10 bg-white/[0.03] border border-white/5 rounded-[40px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                       <Info className="w-20 h-20 text-indigo-400" />
                    </div>
                    <div className="flex items-start space-x-6 relative z-10">
                       <div className="p-3 bg-yellow-400/10 rounded-2xl shrink-0 mt-1 shadow-inner">
                          <Lightbulb className="w-6 h-6 text-yellow-500" />
                       </div>
                       <div className="flex-1">
                          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mb-4">AI Deep Analysis</p>
                          <div className="prose-custom rich-text">
                             <ReactMarkdown>{questions[currentIdx].explanation}</ReactMarkdown>
                          </div>
                       </div>
                    </div>
                    <button 
                       onClick={nextQuestion} 
                       className="mt-10 w-full flex items-center justify-center space-x-3 py-5 bg-white text-gray-900 rounded-[28px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl hover:bg-indigo-600 hover:text-white text-xs border border-transparent"
                    >
                      <span>{currentIdx + 1 >= questions.length ? "Finalize Report" : "Next Segment"}</span>
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Results Screen */}
        {showResult && (
          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }} 
             animate={{ opacity: 1, scale: 1 }} 
             className="bg-white/5 border border-white/10 rounded-[48px] p-16 md:p-24 text-center shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
            <div className="w-24 h-24 bg-indigo-600/10 border border-indigo-500/20 rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-inner">
               <Trophy className="w-10 h-10 text-indigo-400" />
            </div>
            <h3 className="text-4xl font-black text-white mb-4 tracking-tighter">Diagnostic Complete</h3>
            <div className="text-8xl font-black text-white my-12 tracking-tighter drop-shadow-2xl">
               {Math.round((score / (questions.length || flashcards.length)) * 100)}<span className="text-indigo-500">%</span>
            </div>
            <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.5em] mb-12">Accuracy: {score} of {questions.length || flashcards.length} correct</p>
            <button 
               onClick={() => { setShowResult(false); setCurrentIdx(0); setScore(0); setSelectedAnswer(null); generate(); }} 
               className="flex items-center space-x-3 mx-auto px-12 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[24px] font-black uppercase tracking-widest transition-all shadow-2xl shadow-indigo-600/30 text-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart Analysis</span>
            </button>
          </motion.div>
        )}

        {/* Flashcards View */}
        {activeTab === "flashcard" && flashcards.length > 0 && !showResult && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            <div className="text-center">
               <p className="text-gray-600 font-black uppercase text-[10px] tracking-[0.4em]">Component {currentIdx + 1} of {flashcards.length}</p>
            </div>

            <div className="flex justify-center" style={{ perspective: "2000px" }}>
              <div
                className="w-full max-w-2xl cursor-pointer h-96 relative group"
                onClick={() => setFlipped(f => !f)}
              >
                <AnimatePresence mode="wait">
                  {!flipped ? (
                    <motion.div 
                       key="front" 
                       initial={{ rotateY: 90, opacity: 0 }} 
                       animate={{ rotateY: 0, opacity: 1 }} 
                       exit={{ rotateY: -90, opacity: 0 }} 
                       className="absolute inset-0 flex flex-col items-center justify-center p-12 bg-white/5 border border-white/10 rounded-[48px] shadow-2xl backdrop-blur-3xl overflow-hidden"
                    >
                      <div className="absolute top-0 inset-x-0 h-1 bg-indigo-600 opacity-20"></div>
                      <span className="text-3xl font-black text-white text-center leading-tight tracking-tight">{flashcards[currentIdx].front}</span>
                      <p className="absolute bottom-10 text-[9px] text-indigo-400 font-black uppercase tracking-[0.5em] flex items-center space-x-3 bg-indigo-600/10 px-6 py-3 rounded-full border border-indigo-500/10 group-hover:scale-105 transition-all">
                         <RotateCcw className="w-3 h-3" />
                         <span>Invert to reveal</span>
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div 
                       key="back" 
                       initial={{ rotateY: -90, opacity: 0 }} 
                       animate={{ rotateY: 0, opacity: 1 }} 
                       exit={{ rotateY: 90, opacity: 0 }} 
                       className="absolute inset-0 flex flex-col items-center justify-center p-12 bg-indigo-600 border border-indigo-400 text-white rounded-[48px] shadow-2xl overflow-hidden"
                    >
                       <div className="absolute top-0 inset-x-0 h-1 bg-white opacity-20"></div>
                       <div className="prose-custom text-white text-lg text-center leading-relaxed font-bold">
                          <ReactMarkdown>{flashcards[currentIdx].back}</ReactMarkdown>
                       </div>
                       <p className="absolute bottom-10 text-[9px] text-white/50 font-black uppercase tracking-[0.5em]">Answer</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-6">
              <button onClick={() => { if (currentIdx > 0) { setCurrentIdx(i => i - 1); setFlipped(false); } }} disabled={currentIdx === 0} className="w-16 h-16 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-3xl disabled:opacity-10 transition-all border border-white/10 group">
                 <ChevronsRight className="w-6 h-6 rotate-180 group-hover:-translate-x-1 transition-transform" />
              </button>
              <button 
                 onClick={() => { if (currentIdx + 1 < flashcards.length) { setCurrentIdx(i => i + 1); setFlipped(false); } else { setShowResult(true); } }} 
                 className="px-16 py-5 bg-white text-gray-900 rounded-[28px] font-black uppercase tracking-widest shadow-2xl transition-all hover:bg-indigo-600 hover:text-white text-xs"
              >
                 {currentIdx + 1 >= flashcards.length ? "Finish Quiz" : "Next Question"}
              </button>
              <button onClick={() => { if (currentIdx + 1 < flashcards.length) { setCurrentIdx(i => i + 1); setFlipped(false); } }} disabled={currentIdx + 1 >= flashcards.length} className="w-16 h-16 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-3xl disabled:opacity-10 transition-all border border-white/10 group">
                 <ChevronsRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Short Answer View */}
        {activeTab === "short_answer" && shortAnswers.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {shortAnswers.map((qa, i) => (
              <motion.div 
                 key={i} 
                 initial={{ opacity: 0, y: 20 }} 
                 animate={{ opacity: 1, y: 0 }} 
                 transition={{ delay: i * 0.05 }} 
                 className="bg-white/5 border border-white/10 rounded-[32px] p-8 md:p-12 hover:border-indigo-500/20 transition-all shadow-xl group overflow-hidden relative"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-white opacity-5 group-hover:bg-indigo-600 transition-colors"></div>
                <div className="flex items-start space-x-8">
                   <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 font-mono font-black shrink-0 text-xs">
                      {i + 1}
                   </div>
                   <div className="flex-1">
                      <p className="text-xl font-bold text-white mb-8 tracking-tight leading-relaxed">{qa.question}</p>
                      <details className="group">
                        <summary className="inline-flex items-center space-x-3 text-indigo-400 cursor-pointer font-black text-[10px] uppercase tracking-[0.3em] hover:text-white transition-all select-none list-none bg-indigo-600/10 px-6 py-3 rounded-xl border border-indigo-500/10 active:scale-95">
                           <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
                           <span>Decrypt Solution</span>
                        </summary>
                        <motion.div 
                           initial={{ opacity: 0 }} 
                           animate={{ opacity: 1 }}
                           className="mt-8 p-10 bg-white/[0.03] rounded-[32px] text-gray-200 border border-white/5 prose-custom rich-text shadow-inner"
                        >
                           <ReactMarkdown>{qa.answer}</ReactMarkdown>
                        </motion.div>
                      </details>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
