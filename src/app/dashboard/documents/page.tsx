"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, FileText, Search, MessageSquare, Plus, Loader2, Library, Sparkles, BookOpen, Clock, FileUp, Database, Brain, X, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [question, setQuestion] = useState("");
  const [chatLog, setChatLog] = useState<{q: string, a: string}[]>([]);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"summary" | "content">("summary");
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDocs();
  }, []);

  useEffect(() => {
    const container = document.getElementById("docs-chat-container");
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [chatLog, asking]);

  const fetchDocs = async () => {
    try {
        const res = await fetch("/api/upload");
        if (res.ok) {
            const data = await res.json();
            setDocuments(data.documents);
        }
    } catch (e) {
        console.error(e);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        if (res.ok) {
            const data = await res.json();
            setDocuments(prev => [data.document, ...prev]);
        } else {
            const data = await res.json();
            setError(data.message || "Upload failed. Please try again.");
        }
    } catch (e) {
        setError("Connection error. Check your internet.");
    } finally {
        setUploading(false);
        e.target.value = ""; // Reset input
    }
  };

  const askQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !selectedDoc || asking) return;

    setAsking(true);
    const q = question;
    setQuestion("");

    try {
        const res = await fetch("/api/assistant/document", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: q, namespace: selectedDoc.pineconeNamespace }),
        });

        if (res.ok) {
            const data = await res.json();
            setChatLog(prev => [...prev, { q, a: data.answer }]);
        } else {
            setChatLog(prev => [...prev, { q, a: "I'm sorry, I couldn't process that question right now." }]);
        }
    } catch (e) {
        setChatLog(prev => [...prev, { q, a: "Connection error. Failed to reach the assistant." }]);
    } finally {
        setAsking(false);
    }
  };

  return (
    <div className="max-w-[1500px] mx-auto space-y-8 flex flex-col h-[calc(100vh-5rem)] pb-4 px-2 overflow-hidden relative">
      <header className="px-2 space-y-2 shrink-0">
        <div className="flex items-center space-x-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">
           <div className="w-8 h-[1px] bg-indigo-500/30"></div>
           <FileText className="w-3 h-3" />
           <span>Academic Knowledge</span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-none italic">
          Document <span className="text-indigo-500">Library</span>
        </h1>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0 relative">

      {/* Sidebar Docs List */}
      <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-[420px] flex flex-col h-full shrink-0 relative z-10">
        <div className="bg-white/5 border border-white/5 rounded-[48px] p-10 backdrop-blur-3xl shadow-2xl overflow-hidden relative group h-full flex flex-col">
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-1000 grayscale">
              <Database className="w-32 h-32 text-indigo-400" />
           </div>
           
           <div className="flex flex-col mb-10 px-2">
              <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] flex items-center mb-1">
                 Document Library
              </h2>
              <span className="text-white font-black text-xs">PDF FILES ({documents.length})</span>
           </div>
           
           <label className="group relative w-full flex items-center justify-center p-6 bg-white text-gray-950 font-black rounded-[28px] cursor-pointer transition-all active:scale-95 shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:bg-indigo-600 hover:text-white mb-10 overflow-hidden border border-transparent">
             <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
             {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform" /> <span className="text-[10px] uppercase tracking-[0.3em]">Upload Document</span></>}
             <input type="file" accept="application/pdf" className="hidden" onChange={handleUpload} disabled={uploading} />
           </label>

           <AnimatePresence>
             {error && (
               <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between overflow-hidden">
                  <span className="text-[10px] text-red-400 font-black uppercase tracking-widest">{error}</span>
                  <button onClick={() => setError(null)}><X className="w-4 h-4 text-red-400" /></button>
               </motion.div>
             )}
           </AnimatePresence>

           <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {documents.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-48 opacity-20 py-20">
                   <FileText className="w-16 h-16 mb-6" />
                   <p className="text-[10px] font-black uppercase tracking-[0.4em]">Library Empty</p>
                 </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {documents.map((doc, idx) => (
                     <motion.button
                       key={doc._id}
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       transition={{ delay: idx * 0.03 }}
                       onClick={() => { setSelectedDoc(doc); setChatLog([]); setActiveView("summary"); }}
                       className={`w-all mx-1 text-left p-6 rounded-[32px] transition-all border group/item relative overflow-hidden flex flex-col ${selectedDoc?._id === doc._id ? "bg-indigo-600 text-white border-transparent shadow-2xl shadow-indigo-600/40 translate-x-1" : "bg-white/[0.03] border-white/5 hover:border-white/20 hover:bg-white/5"}`}
                     >
                       <div className="flex items-center space-x-5">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${selectedDoc?._id === doc._id ? 'bg-white/20' : 'bg-indigo-500/10 text-indigo-400 group-hover/item:scale-110 group-hover/item:rotate-3'}`}>
                             <FileText className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <h4 className="font-black truncate text-sm tracking-tight leading-tight mb-1">{doc.filename}</h4>
                             <div className="flex items-center space-x-3">
                                <span className={`text-[9px] font-black uppercase tracking-widest ${selectedDoc?._id === doc._id ? 'text-white/60' : 'text-gray-600'}`}>
                                   {new Date(doc.createdAt).toLocaleDateString()}
                                </span>
                                <div className={`w-1 h-1 rounded-full ${selectedDoc?._id === doc._id ? 'bg-white/30' : 'bg-indigo-500/20'}`}></div>
                                <span className={`text-[9px] font-black uppercase tracking-widest ${selectedDoc?._id === doc._id ? 'text-white/60' : 'text-indigo-400/60'}`}>PDF File</span>
                             </div>
                          </div>
                       </div>
                     </motion.button>
                  ))}
                </AnimatePresence>
              )}
           </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex-1 flex flex-col bg-white/5 border border-white/5 rounded-[56px] backdrop-blur-3xl overflow-hidden shadow-2xl relative min-w-0">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-600 to-transparent"></div>
        
        {selectedDoc ? (
          <>
            <div className="p-10 md:p-14 border-b border-white/[0.03] bg-black/40 flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-20">
               <div className="flex items-center space-x-8">
                  <div className="w-16 h-16 bg-indigo-600 rounded-[24px] shadow-2xl shadow-indigo-600/30 flex items-center justify-center text-white rotate-3">
                    <Brain className="w-8 h-8" />
                  </div>
                  <div className="flex flex-col">
                     <h3 className="text-3xl font-black text-white tracking-tighter mb-1 italic">{selectedDoc.filename}</h3>
                     <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em]">Ready to analyze</span>
                     </div>
                  </div>
               </div>
               <button onClick={() => setSelectedDoc(null)} className="p-5 bg-white/5 hover:bg-white/10 rounded-[28px] text-gray-600 hover:text-white transition-all border border-white/5 group active:scale-95">
                  <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
               </button>
            </div>
            
            <div id="docs-chat-container" className="flex-1 overflow-y-auto p-10 md:p-20 space-y-12 custom-scrollbar relative">
               <div className="flex items-center space-x-4 mb-8">
                  <button 
                    onClick={() => setActiveView("summary")}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === "summary" ? "bg-indigo-600 text-white shadow-lg" : "bg-white/5 text-gray-500 hover:text-white"}`}
                  >
                    Abstract
                  </button>
                  <button 
                    onClick={() => setActiveView("content")}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === "content" ? "bg-indigo-600 text-white shadow-lg" : "bg-white/5 text-gray-500 hover:text-white"}`}
                  >
                    Full Text
                  </button>
               </div>

               <AnimatePresence mode="wait">
                 {activeView === "summary" ? (
                   <motion.div 
                     key="summary"
                     initial={{ opacity: 0, scale: 0.98 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.98 }}
                     className="bg-indigo-600/5 p-10 rounded-[48px] border border-indigo-500/10 relative overflow-hidden group shadow-inner"
                   >
                      <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-125 transition-transform duration-1000 grayscale pointer-events-none">
                         <Sparkles className="w-32 h-32 text-indigo-400" />
                      </div>
                      <div className="flex items-center space-x-4 mb-6">
                         <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.6em]">Document Summary</span>
                         <div className="flex-1 h-[1px] bg-indigo-500/10"></div>
                      </div>
                      <p className="text-lg text-gray-200 leading-[1.8] font-medium relative z-10 first-letter:text-5xl first-letter:font-black first-letter:text-indigo-400 first-letter:mr-4 first-letter:float-left">
                        {selectedDoc.summary}
                      </p>
                   </motion.div>
                 ) : (
                   <motion.div 
                     key="content"
                     initial={{ opacity: 0, scale: 0.98 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.98 }}
                     className="bg-[#0a0a12] p-8 rounded-[28px] border border-white/5 shadow-inner max-h-[420px] overflow-y-auto custom-scrollbar"
                   >
                      <div className="flex items-center space-x-4 mb-6">
                         <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.6em]">Extracted Text</span>
                         <div className="flex-1 h-[1px] bg-white/5"></div>
                      </div>
                      <div className="text-sm text-gray-400 leading-relaxed font-mono whitespace-pre-wrap">
                        {selectedDoc.content || "Text extraction pending."}
                      </div>
                   </motion.div>
                 )}
               </AnimatePresence>
               
               {chatLog.length > 0 && (
                 <div className="flex items-center gap-4 mt-4">
                   <div className="flex-1 h-px bg-white/5"></div>
                   <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest shrink-0">Questions & Answers</span>
                   <div className="flex-1 h-px bg-white/5"></div>
                 </div>
               )}

               <AnimatePresence mode="popLayout">
                 {chatLog.length === 0 && (
                   <div className="flex flex-col items-center justify-center py-20 text-center group opacity-20 hover:opacity-100 transition-opacity duration-700">
                      <div className="w-32 h-32 bg-white/1 rounded-[48px] border-2 border-dashed border-white/5 flex items-center justify-center mb-8 relative shadow-2xl group-hover:scale-110 transition-transform duration-700">
                         <Search className="w-10 h-10 text-gray-600" />
                         <div className="absolute inset-0 border-2 border-dashed border-indigo-500/20 rounded-[48px] animate-[spin_60s_linear_infinite]"></div>
                      </div>
                      <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 group-hover:tracking-widest transition-all duration-700">Ask the Document</h4>
                      <p className="text-[10px] font-black max-w-xs leading-relaxed uppercase tracking-[0.4em] text-gray-700">Type a question below to find specific answers inside this document.</p>
                   </div>
                 )}
                 
                 {chatLog.map((log, idx) => (
                   <motion.div key={idx} initial={{ opacity: 0, y: 30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="space-y-10">
                      <div className="flex items-start justify-end">
                        <div className="px-6 py-4 bg-indigo-600 rounded-3xl rounded-tr-sm text-white max-w-[85%] text-sm font-medium shadow-lg border border-white/10">
                           {log.q}
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 shadow-lg">
                           <Brain className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div className="flex-1 bg-white/[0.04] rounded-2xl rounded-tl-sm p-5 border border-white/5 text-gray-200 shadow-md prose-custom rich-text text-sm leading-7">
                           <ReactMarkdown>{log.a}</ReactMarkdown>
                        </div>
                      </div>
                   </motion.div>
                 ))}
                 
                 {asking && (
                   <div className="flex items-start gap-8">
                      <div className="w-14 h-14 rounded-[22px] bg-white/5 border border-white/10 flex items-center justify-center shrink-0 animate-pulse">
                         <Brain className="w-7 h-7 text-indigo-500/50" />
                      </div>
                      <div className="px-12 py-8 bg-white/1 border border-white/5 rounded-[48px] rounded-tl-none flex items-center space-x-4 shadow-inner">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] ml-6 animate-pulse">Analyzing text...</span>
                      </div>
                   </div>
                 )}
               </AnimatePresence>
               <div ref={chatEndRef} className="h-10" />
            </div>

            <div className="p-10 md:p-14 bg-black/40 border-t border-white/[0.03] backdrop-blur-3xl relative z-20">
              <form onSubmit={askQuestion} className="flex space-x-6 max-w-6xl mx-auto items-center">
                 <div className="flex-1 relative group">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask a question about this document..."
                      className="w-full px-12 py-7 bg-white/5 border border-white/5 rounded-[36px] text-white outline-none focus:border-indigo-500 font-semibold placeholder:text-gray-700 transition-all text-base group-focus-within:bg-white/10 shadow-inner pr-32"
                      disabled={asking}
                    />
                    <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-all">
                       <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
                    </div>
                 </div>
                <button type="submit" disabled={asking || !question.trim()} className="w-20 h-20 flex items-center justify-center rounded-[32px] bg-white text-gray-950 hover:bg-indigo-600 hover:text-white transition-all active:scale-90 disabled:opacity-20 shrink-0 shadow-[0_30px_60px_rgba(0,0,0,0.5)] group relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <MessageSquare className="w-8 h-8 relative z-10 group-hover:scale-110 transition-transform" />
                </button>
              </form>
              <div className="flex items-center justify-between mt-10 px-6">
                 <p className="text-[9px] text-gray-800 font-black uppercase tracking-[0.6em]">Document Intelligence Engine</p>
                 <div className="flex items-center space-x-4 opacity-50">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-700">Online</span>
                 </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 p-20 text-center group relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-600/20 to-transparent"></div>
            <div className="w-32 h-32 bg-white/1 rounded-[56px] flex items-center justify-center mb-12 relative shadow-2xl group-hover:scale-110 transition-transform duration-700">
               <FileText className="w-12 h-12 text-white/5 group-hover:text-indigo-600/40 transition-colors" />
               <div className="absolute inset-x-0 inset-y-0 border-2 border-dashed border-white/5 rounded-[56px] animate-[spin_30s_linear_infinite]"></div>
            </div>
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-6 group-hover:tracking-widest transition-all duration-700">No Document Selected</h3>
            <p className="max-w-md mx-auto text-[10px] font-black text-gray-800 leading-relaxed uppercase tracking-[0.4em] mb-16 px-10">
               Select an existing document from your library or upload a new PDF to get started.
            </p>
            <div className="flex items-center space-x-3 opacity-20">
               <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
               <div className="w-12 h-[1px] bg-white"></div>
               <span className="text-[8px] font-black uppercase tracking-widest">Awaiting Input</span>
               <div className="w-12 h-[1px] bg-white"></div>
               <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>
        )}
      </motion.div>
      </div>
    </div>
  );
}
