"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { 
  Plus, Trash2, CheckCircle, Circle, ChevronDown, ChevronRight, 
  BookMarked, GraduationCap, Target, Layers, ArrowRight, Sparkles,
  FileText, Youtube, Share2, MessageSquare, Loader2, BookOpen, Clock, FileUp, X, Zap, Brain, Library
} from "lucide-react";

type Topic = { 
  _id: string; 
  name: string; 
  isCompleted: boolean; 
  progress: number;
  notes?: string;
  youtubeLinks?: string[];
  studyLinks?: string[];
  documentId?: string;
};
type Subject = { _id: string; name: string; topics: Topic[] };

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await fetch("/api/subjects");
      if (res.ok) {
        const data = await res.json();
        setSubjects(data.subjects);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || adding) return;
    setAdding(true);
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSubject }),
      });
      if (res.ok) {
        setNewSubject("");
        await fetchSubjects();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const deleteSubject = async (id: string) => {
    if (!confirm("Remove this subject and all its topics?")) return;
    await fetch(`/api/subjects/${id}`, { method: "DELETE" });
    fetchSubjects();
  };

  const addTopic = async (subjectId: string, topicName: string) => {
    if (!topicName.trim()) return;
    await fetch(`/api/subjects/${subjectId}/topics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: topicName }),
    });
    fetchSubjects();
  };

  const toggleTopicCompletion = async (subjectId: string, topic: Topic) => {
    await fetch(`/api/subjects/${subjectId}/topics/${topic._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCompleted: !topic.isCompleted, progress: !topic.isCompleted ? 100 : 0 }),
    });
    fetchSubjects();
  };

  const deleteTopic = async (subjectId: string, topicId: string) => {
    await fetch(`/api/subjects/${subjectId}/topics/${topicId}`, { method: "DELETE" });
    fetchSubjects();
  };

  if (loading) return <SkeletonSubjects />;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 px-2 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
        <div className="space-y-1">
          <div className="flex items-center space-x-3 mb-2">
             <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
                <GraduationCap className="w-6 h-6 text-white" />
             </div>
             <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-white tracking-tight">Subjects</h1>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">Your Curriculum</span>
             </div>
          </div>
          <p className="text-gray-400 max-w-xl text-sm leading-relaxed">Manage your subjects and track your progress across all topics.</p>
        </div>
        
        <form onSubmit={addSubject} className="flex relative w-full md:w-96 group">
          <input
            type="text"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            placeholder="Add a subject (e.g. Psychology 101)"
            className="flex-1 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all font-semibold placeholder:text-gray-600 shadow-inner group-focus-within:bg-black/20"
          />
          <button 
             type="submit" 
             disabled={adding || !newSubject.trim()}
             className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase tracking-widest transition-all disabled:opacity-20 flex items-center shadow-lg active:scale-95 text-[10px]"
          >
            {adding ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Plus className="w-4 h-4 mr-2" />}
            <span>{adding ? '...' : 'Add'}</span>
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {subjects.length === 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-32 bg-white/5 border border-white/5 rounded-[56px] flex flex-col items-center shadow-2xl">
              <div className="w-24 h-24 bg-white/2 rounded-[32px] flex items-center justify-center mb-8 border border-white/5 relative">
                 <BookMarked className="w-10 h-10 text-gray-700" />
                 <div className="absolute inset-0 border-2 border-dashed border-white/10 rounded-[32px] animate-[spin_60s_linear_infinite]"></div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Subjects Yet</h3>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] max-w-xs mx-auto leading-relaxed">Add your first subject above to start tracking your progress.</p>
            </motion.div>
          )}

          {subjects.map((subject, index) => {
            const isExpanded = expandedSubject === subject._id;
            const completedTopics = subject.topics.filter(t => t.isCompleted).length;
            const progressPerc = subject.topics.length === 0 ? 0 : Math.round((completedTopics / subject.topics.length) * 100);

            return (
              <motion.div 
                 key={subject._id} 
                 initial={{ opacity: 0, y: 30 }} 
                 animate={{ opacity: 1, y: 0 }} 
                 transition={{ delay: index * 0.05 }}
                 className={`overflow-hidden rounded-[40px] transition-all duration-500 border relative group shadow-2xl ${isExpanded ? 'bg-white/10 border-indigo-500/30' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
              >
                <div 
                  className="p-8 md:p-12 flex items-center justify-between cursor-pointer transition select-none relative z-10"
                  onClick={() => setExpandedSubject(isExpanded ? null : subject._id)}
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-white opacity-5 group-hover:bg-indigo-600 transition-colors"></div>
                  
                  <div className="flex items-center space-x-8">
                    <div className={`w-20 h-20 rounded-[32px] transition-all duration-700 flex items-center justify-center shadow-2xl ${isExpanded ? 'bg-indigo-600 text-white scale-110 !rotate-0 shadow-indigo-600/40' : 'bg-white/5 text-indigo-400 group-hover:rotate-6'}`}>
                      <Layers className="w-10 h-10" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-white mb-3 tracking-tight italic">{subject.name}</h3>
                      <div className="flex items-center space-x-6">
                         <div className="flex items-center space-x-2">
                           <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                           <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">{completedTopics}/{subject.topics.length} Topics</span>
                         </div>
                         <div className="w-[1px] h-3 bg-white/10"></div>
                         <span className={`text-[10px] font-black uppercase tracking-[0.4em] transition-colors px-3 py-1 rounded-full ${progressPerc === 100 ? 'bg-green-500/10 text-green-400 border border-green-500/10' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10'}`}>{progressPerc}% Completed</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-10">
                    <div className="hidden lg:flex flex-col items-end space-y-3 w-56">
                      <div className="flex justify-between w-full text-[9px] font-black uppercase text-gray-600 tracking-[0.3em]">
                        <span>Progress</span>
                        <span>{progressPerc}%</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden p-px border border-white/5">
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${progressPerc}%` }}
                           className={`h-full rounded-full transition-all duration-1000 ${progressPerc === 100 ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]'}`} 
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteSubject(subject._id); }} 
                        className="p-3 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all active:scale-95"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <div className={`p-2 transition-transform duration-500 rounded-full ${isExpanded ? 'rotate-180 bg-indigo-600/20 text-indigo-400' : 'text-gray-700 bg-white/5'}`}>
                         <ChevronDown className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-12 pb-12 pt-4 relative z-10">
                        <div className="h-[2px] bg-white opacity-[0.03] mb-12"></div>
                        <TopicList subject={subject} addTopic={addTopic} toggleTopicCompletion={toggleTopicCompletion} deleteTopic={deleteTopic} fetchSubjects={fetchSubjects} />
                      </div>
                      <div className="absolute bottom-0 right-0 p-12 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000 grayscale">
                         <Target className="w-64 h-64 text-indigo-400" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TopicList({ subject, addTopic, toggleTopicCompletion, deleteTopic, fetchSubjects }: { subject: Subject, addTopic: any, toggleTopicCompletion: any, deleteTopic: any, fetchSubjects: any }) {
  const [newTopic, setNewTopic] = useState("");
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;
    addTopic(subject._id, newTopic);
    setNewTopic("");
  };

  return (
    <div className="space-y-10">
      <form onSubmit={handleAdd} className="flex relative items-center max-w-2xl group">
        <input 
          type="text" 
          value={newTopic} 
          onChange={(e) => setNewTopic(e.target.value)} 
          placeholder="New topic..." 
          className="w-full px-8 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500/50 transition-all font-semibold shadow-inner group-focus-within:bg-black/20" 
        />
        <button type="submit" className="absolute right-2 px-6 py-2 bg-white text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all active:scale-95 flex items-center space-x-2 shadow-xl border border-transparent">
           <Plus className="w-3 h-3" />
           <span>Add</span>
        </button>
      </form>
      
      <div className="space-y-6">
        {subject.topics.map((topic, i) => (
          <div key={topic._id} className="space-y-4">
            <motion.div 
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: i * 0.02 }}
               className={`flex items-center justify-between p-6 rounded-[32px] border transition-all group/topic shadow-lg backdrop-blur-sm ${topic.isCompleted ? 'bg-green-500/5 border-green-500/10' : 'bg-white/[0.02] border-white/5 hover:border-indigo-500/30'}`}
            >
              <div className="flex items-center space-x-6 cursor-pointer flex-1" onClick={() => toggleTopicCompletion(subject._id, topic)}>
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${topic.isCompleted ? 'bg-green-500 text-white border-transparent shadow-lg shadow-green-500/20' : 'bg-white/5 text-gray-700 border-white/5 hover:text-indigo-400 group-hover/topic:scale-110'}`}>
                  {topic.isCompleted ? <CheckCircle className="w-7 h-7" /> : <Circle className="w-6 h-6" />}
                </div>
                <div className="flex flex-col">
                  <span className={`text-base font-semibold tracking-tight transition-all leading-snug ${topic.isCompleted ? 'text-gray-500 line-through' : 'text-gray-100 group-hover/topic:text-white'}`}>{topic.name}</span>
                  <div className="flex items-center space-x-3 mt-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">ID: {topic._id.slice(-4).toUpperCase()}</span>
                    {topic.notes && <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>}
                    {topic.notes && <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Notes Added</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setActiveTopicId(activeTopicId === topic._id ? null : topic._id)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center space-x-2 ${activeTopicId === topic._id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'bg-white/5 text-gray-500 hover:text-indigo-400'}`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{activeTopicId === topic._id ? 'Close Notes' : 'Notes'}</span>
                </button>
                <button onClick={() => deleteTopic(subject._id, topic._id)} className="p-3 text-gray-700 hover:text-red-400 transition-all active:scale-90 lg:opacity-0 group-hover/topic:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            <AnimatePresence>
              {activeTopicId === topic._id && (
                <ResourceHub 
                   subject={subject} 
                   topic={topic} 
                   fetchSubjects={fetchSubjects} 
                />
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      
      {subject.topics.length === 0 && (
        <div className="py-16 text-center border-2 border-dashed border-white/[0.02] rounded-[32px] flex flex-col items-center">
           <Sparkles className="w-10 h-10 text-gray-800 mb-4" />
           <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em]">Add topics to build your curriculum.</p>
        </div>
      )}
    </div>
  );
}

function ResourceHub({ subject, topic, fetchSubjects }: { subject: any, topic: any, fetchSubjects: any }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const generateNotes = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/subjects/${subject._id}/topics/${topic._id}/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate-notes", topicName: topic.name }),
      });
      if (res.ok) {
        await fetchSubjects();
      } else {
        setError("Generation failed.");
      }
    } catch (err) {
      setError("Network error.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("PDF files only.");
      return;
    }

    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        // Update topic with documentId
        await fetch(`/api/subjects/${subject._id}/topics/${topic._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentId: data.document._id }),
        });
        await fetchSubjects();
        setMessage("DOCUMENT UPLOADED! 📁");
        setTimeout(() => setMessage(null), 3000);
      } else {
        const data = await res.json();
        setError(data.message || "Upload failed.");
      }
    } catch (err) {
      setError("Network error.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div 
       initial={{ height: 0, opacity: 0 }} 
       animate={{ height: "auto", opacity: 1 }} 
       exit={{ height: 0, opacity: 0 }}
       className="overflow-hidden"
    >
      <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12 space-y-10 shadow-2xl relative">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none grayscale">
           <Library className="w-48 h-48 text-indigo-400" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                 <h4 className="text-xl font-bold text-white tracking-tight">Resource Hub</h4>
                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Materials for {topic.name}</p>
              </div>
              <div className="flex items-center space-x-3">
                 <label className="px-5 py-2.5 bg-white text-black hover:bg-indigo-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all active:scale-95 flex items-center shadow-lg">
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><FileUp className="w-4 h-4 mr-2" /> <span>Upload PDF</span></>}
                    <input type="file" accept="application/pdf" className="hidden" onChange={handleUpload} disabled={isUploading} />
                 </label>
                 <button 
                   onClick={generateNotes}
                   disabled={isGenerating}
                   className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center shadow-lg shadow-indigo-600/20"
                 >
                   {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4 mr-2" /> <span>AI Notes</span></>}
                 </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center">
                 <Zap className="w-4 h-4 mr-3" />
                 {error}
              </div>
            )}

            {message && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center">
                 <CheckCircle className="w-4 h-4 mr-3" />
                 {message}
              </div>
            )}

            <div className="bg-black/40 border border-white/5 rounded-[32px] p-8 md:p-10 min-h-[200px] relative">
               {!topic.notes && !isGenerating ? (
                 <div className="flex flex-col items-center justify-center h-full py-10 opacity-20">
                    <Brain className="w-12 h-12 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">Generate AI notes to get started.</p>
                 </div>
               ) : isGenerating ? (
                 <div className="flex flex-col items-center justify-center h-full py-10">
                    <div className="w-12 h-12 border-2 border-dashed border-indigo-500 rounded-full animate-spin mb-6"></div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.6em] animate-pulse">Generating Notes...</p>
                 </div>
               ) : (
                 <div className="prose-custom rich-text">
                   <ReactMarkdown>{topic.notes}</ReactMarkdown>
                 </div>
               )}
            </div>

            {topic.documentId && <TopicChat topic={topic} />}
          </div>

          <div className="w-full lg:w-96 space-y-8">
            <div className="bg-white/5 border border-white/5 rounded-[40px] p-10 space-y-8 relative overflow-hidden group/card shadow-2xl">
               <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover/card:scale-110 transition-transform duration-700">
                  <Youtube className="w-24 h-24 text-red-500" />
               </div>
               <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] flex items-center">
                  YouTube Tutorials
               </h5>
               <div className="space-y-4 relative z-10">
                  {topic.youtubeLinks && topic.youtubeLinks.length > 0 ? (
                    topic.youtubeLinks.map((link: any, i: number) => {
                      const isObject = typeof link === 'object' && link !== null;
                      const title = isObject ? link.title : link;
                      const url = isObject ? link.url : `https://www.youtube.com/results?search_query=${encodeURIComponent(link)}`;
                      return (
                        <a 
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-5 bg-white/[0.03] border border-white/5 rounded-2xl group/link cursor-pointer hover:border-red-500/30 hover:bg-red-500/5 transition-all shadow-md active:scale-95"
                        >
                           <div className="flex justify-between items-start">
                              <p className="text-xs font-bold text-gray-200 leading-relaxed group-hover/link:text-red-400">{title}</p>
                              <ArrowRight className="w-3 h-3 text-gray-700 group-hover/link:text-red-400 mt-1" />
                           </div>
                        </a>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center opacity-20">
                       <Youtube className="w-10 h-10 mx-auto mb-3" />
                       <p className="text-[9px] font-black uppercase tracking-widest">No assets indexed.</p>
                    </div>
                  )}
               </div>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-[40px] p-10 space-y-8 relative overflow-hidden group/card shadow-2xl">
               <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover/card:scale-110 transition-transform duration-700">
                  <BookOpen className="w-24 h-24 text-emerald-400" />
               </div>
               <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] flex items-center">
                  Study Resources
               </h5>
               <div className="space-y-4 relative z-10">
                  {topic.studyLinks && topic.studyLinks.length > 0 ? (
                    topic.studyLinks.map((link: any, i: number) => {
                      const isObject = typeof link === 'object' && link !== null;
                      const title = isObject ? link.title : link;
                      const url = isObject ? link.url : `https://www.google.com/search?q=${encodeURIComponent(link)}`;
                      return (
                        <a 
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-5 bg-white/[0.03] border border-white/5 rounded-2xl group/link cursor-pointer hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all shadow-md active:scale-95"
                        >
                           <div className="flex justify-between items-start">
                              <p className="text-xs font-bold text-gray-200 leading-relaxed group-hover/link:text-emerald-400">{title}</p>
                              <ArrowRight className="w-3 h-3 text-gray-700 group-hover/link:text-emerald-400 mt-1" />
                           </div>
                        </a>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center opacity-20">
                       <BookOpen className="w-10 h-10 mx-auto mb-3" />
                       <p className="text-[9px] font-black uppercase tracking-widest">No links indexed.</p>
                    </div>
                  )}
               </div>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-[40px] p-10 space-y-8 relative overflow-hidden group/card shadow-2xl">
               <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover/card:scale-110 transition-transform duration-700">
                  <Share2 className="w-24 h-24 text-indigo-400" />
               </div>
               <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] flex items-center">
                  Study Documents
               </h5>
               <div className="space-y-4 relative z-10">
                  {topic.documentId ? (
                    <Link 
                      href="/dashboard/documents"
                      className="w-full p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-[28px] flex items-center justify-between group/doc active:scale-95 transition-all text-left shadow-lg"
                    >
                       <div className="flex items-center space-x-5">
                          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                             <FileText className="w-6 h-6" />
                          </div>
                          <div className="flex flex-col">
                             <span className="text-xs font-black text-white uppercase tracking-wider">Linked PDF</span>
                             <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1">Status: Indexed</span>
                          </div>
                       </div>
                       <ArrowRight className="w-4 h-4 text-indigo-500 group-hover/doc:translate-x-1 transition-transform" />
                    </Link>
                  ) : (
                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[28px] flex items-center justify-between opacity-40 grayscale">
                       <div className="flex items-center space-x-5">
                          <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center text-gray-600">
                             <FileText className="w-6 h-6" />
                          </div>
                          <div className="flex flex-col">
                             <span className="text-xs font-black text-gray-500 uppercase tracking-wider">No local research</span>
                             <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest mt-1 italic">Not linked</span>
                          </div>
                       </div>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TopicChat({ topic }: { topic: any }) {
  const [question, setQuestion] = useState("");
  const [chatLog, setChatLog] = useState<{q: string, a: string}[]>([]);
  const [asking, setAsking] = useState(false);
  const [docNamespace, setDocNamespace] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoc = async () => {
      const res = await fetch(`/api/documents/${topic.documentId}`);
      if (res.ok) {
        const data = await res.json();
        setDocNamespace(data.document.pineconeNamespace);
      }
    };
    fetchDoc();
  }, [topic.documentId]);

  const askQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !docNamespace || asking) return;

    setAsking(true);
    const q = question;
    setQuestion("");
    try {
      const res = await fetch("/api/assistant/document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, namespace: docNamespace }),
      });
      if (res.ok) {
        const data = await res.json();
        setChatLog(prev => [...prev, { q, a: data.answer }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-[32px] p-8 space-y-6">
       <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center">
          <MessageSquare className="w-4 h-4 mr-2" /> Document Assistant
       </h5>
       
       <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar">
          {chatLog.map((log, i) => (
            <div key={i} className="space-y-3">
               <div className="flex justify-end">
                  <span className="bg-indigo-600 text-white px-4 py-2 rounded-2xl rounded-tr-none text-xs font-bold">{log.q}</span>
               </div>
               <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none text-xs text-gray-300 prose-custom rich-text">
                  <ReactMarkdown>{log.a}</ReactMarkdown>
               </div>
            </div>
          ))}
          {asking && <div className="text-[10px] font-black text-indigo-400 animate-pulse uppercase tracking-widest">Assistant Thinking...</div>}
       </div>

       <form onSubmit={askQuestion} className="flex space-x-3">
          <input 
             type="text" 
             value={question} 
             onChange={(e) => setQuestion(e.target.value)} 
             placeholder="Ask about the topic PDF..." 
             className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-all font-semibold"
          />
          <button type="submit" disabled={asking || !question.trim()} className="p-2 bg-white text-black rounded-xl hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-20 active:scale-90">
             <ArrowRight className="w-4 h-4" />
          </button>
       </form>
    </div>
  );
}

function SkeletonSubjects() {
    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-pulse px-2">
            <div className="flex justify-between items-end gap-10">
                <div className="h-28 bg-white/5 rounded-[40px] w-1/2"></div>
                <div className="h-16 bg-white/5 rounded-2xl w-1/3"></div>
            </div>
            <div className="space-y-6">
                {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white/5 rounded-[48px]"></div>)}
            </div>
        </div>
    );
}
