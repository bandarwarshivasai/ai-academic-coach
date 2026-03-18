"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Download, Sparkles, Save, FileText, NotebookPen, Clock, Tag, ChevronRight, PenTool, Database, Search, FileDown, Eye, FileEdit } from "lucide-react";
import ReactMarkdown from "react-markdown";

type NoteType = { _id: string; title: string; content: string; subject?: string; updatedAt: string };

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [selectedNote, setSelectedNote] = useState<NoteType | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const [saving, setSaving] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => { fetchNotes(); }, []);

  const fetchNotes = async () => {
    try {
        const res = await fetch("/api/notes");
        if (res.ok) { const data = await res.json(); setNotes(data.notes || []); }
    } catch (e) { console.error(e); }
  };

  const createNote = async () => {
    try {
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "INITIATED_NODE", content: "", subject: "" }),
        });
        if (res.ok) {
          const data = await res.json();
          await fetchNotes();
          selectNote(data.note);
          setPreviewMode(false);
        }
    } catch (e) { console.error(e); }
  };

  const selectNote = (note: NoteType) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setSubject(note.subject || "");
  };

  const saveNote = async () => {
    if (!selectedNote) return;
    setSaving(true);
    try {
        await fetch(`/api/notes/${selectedNote._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, subject }),
        });
        fetchNotes();
        // Update selected note reference so we don't lose the ID but keep sync
        setSelectedNote({ ...selectedNote, title, content, subject });
    } catch (e) { console.error(e); } finally {
        setSaving(false);
    }
  };

  const deleteNote = async (id: string) => {
    if (!confirm("Remove this knowledge node from the repository?")) return;
    try {
        await fetch(`/api/notes/${id}`, { method: "DELETE" });
        if (selectedNote?._id === id) { setSelectedNote(null); setTitle(""); setContent(""); }
        fetchNotes();
    } catch (e) { console.error(e); }
  };

  const summarizeNote = async () => {
    if (!content.trim()) return;
    setSummarizing(true);
    try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: `Summarize the following notes concisely in professional bullet points with markdown bolding:\n\n${content}` }],
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const summary = "\n\n---\n### AI KNOWLEDGE SUMMARY\n" + data.response;
          setContent(content + summary);
          setPreviewMode(true);
        }
    } catch (e) { console.error(e); } finally {
        setSummarizing(false);
    }
  };

  const downloadPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(title, 15, 20);
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(content, 180);
    doc.text(lines, 15, 35);
    doc.save(`${title.replace(/\s+/g, '_')}_notes.pdf`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-[1500px] mx-auto h-[calc(100vh-10rem)] pb-4 px-2 text-white">
      {/* Sidebar - Note List */}
      <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-96 flex flex-col space-y-6 shrink-0 h-full">
        <div className="bg-white/5 border border-white/5 rounded-[48px] p-8 backdrop-blur-3xl shadow-2xl overflow-hidden relative group h-full flex flex-col">
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-1000 grayscale">
              <Database className="w-32 h-32 text-indigo-400" />
           </div>
           
           <div className="flex items-center justify-between mb-10 px-2 relative z-10">
              <div className="flex flex-col">
                 <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] flex items-center mb-1">
                    Knowledge Base
                 </h2>
                 <span className="text-white font-bold text-xs">RESEARCH_NODES ({notes.length})</span>
              </div>
              <button onClick={createNote} className="w-12 h-12 bg-white text-gray-950 hover:bg-indigo-600 hover:text-white rounded-[18px] flex items-center justify-center transition-all active:scale-90 shadow-2xl group/add">
                 <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
              </button>
           </div>

           <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar relative z-10">
              <AnimatePresence mode="popLayout">
                {notes.map((note, i) => (
                  <motion.button
                    key={note._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => selectNote(note)}
                    className={`w-all mx-1 text-left p-6 rounded-[32px] transition-all border group/item relative overflow-hidden flex flex-col ${selectedNote?._id === note._id ? "bg-indigo-600 text-white border-transparent shadow-2xl shadow-indigo-600/40 translate-x-1" : "bg-white/[0.03] border-white/5 hover:border-white/20 hover:bg-white/5"}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className={`text-sm font-black tracking-tight truncate flex-1 ${selectedNote?._id === note._id ? 'text-white' : 'text-gray-300'}`}>{note.title}</h4>
                      <button onClick={(e) => { e.stopPropagation(); deleteNote(note._id); }} className="opacity-0 group-hover/item:opacity-60 hover:!opacity-100 text-red-500 transition-all p-1 hover:bg-red-500/10 rounded-lg">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-4">
                       <div className="flex items-center text-[9px] font-black uppercase tracking-widest text-opacity-70 opacity-40">
                          <Clock className="w-3 h-3 mr-1.5" />
                          {new Date(note.updatedAt).toLocaleDateString()}
                       </div>
                       {note.subject && (
                          <div className={`flex items-center text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${selectedNote?._id === note._id ? 'bg-white/20 border-white/10 text-white' : 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400'}`}>
                             {note.subject}
                          </div>
                       )}
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
              {notes.length === 0 && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-40 opacity-20">
                    <NotebookPen className="w-20 h-20 text-gray-500 mx-auto mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500">Repository Empty</p>
                 </motion.div>
              )}
           </div>
        </div>
      </motion.div>

      {/* Editor Main Area */}
      <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex-1 flex flex-col bg-white/5 border border-white/5 rounded-[56px] backdrop-blur-3xl overflow-hidden shadow-2xl relative min-w-0">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-600 to-transparent"></div>
        
        {selectedNote ? (
          <div className="flex flex-col h-full">
            {/* Sophisticated Toolbar */}
            <div className="p-10 md:p-14 border-b border-white/[0.03] bg-black/40 flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-20">
              <div className="flex-1 space-y-5">
                 <input
                   value={title}
                   onChange={e => setTitle(e.target.value)}
                   className="text-4xl font-black text-white bg-transparent outline-none w-full tracking-tighter focus:text-indigo-400 transition-colors placeholder:text-gray-800"
                   placeholder="NODE_IDENTIFIER..."
                 />
                 <div className="flex items-center space-x-4 bg-white/5 border border-white/5 px-6 py-2.5 rounded-[20px] w-fit shadow-inner group/sub">
                    <Tag className="w-4 h-4 text-gray-500 group-focus-within/sub:text-indigo-400 transition-colors" />
                    <input
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder="DOMAIN_TAG..."
                      className="bg-transparent text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 outline-none w-48 placeholder:text-gray-800"
                    />
                 </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex bg-white/5 p-1.5 rounded-[22px] border border-white/5 mr-2">
                   <button onClick={() => setPreviewMode(false)} className={`flex items-center space-x-2 px-6 py-2.5 rounded-[18px] text-[9px] font-black uppercase tracking-widest transition-all ${!previewMode ? 'bg-indigo-600 shadow-xl shadow-indigo-600/20 text-white' : 'text-gray-500 hover:text-white'}`}>
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                   </button>
                   <button onClick={() => setPreviewMode(true)} className={`flex items-center space-x-2 px-6 py-2.5 rounded-[18px] text-[9px] font-black uppercase tracking-widest transition-all ${previewMode ? 'bg-indigo-600 shadow-xl shadow-indigo-600/20 text-white' : 'text-gray-500 hover:text-white'}`}>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                   </button>
                </div>
                
                <button onClick={summarizeNote} disabled={summarizing} className="flex items-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 border border-white/5 group/btn">
                   <Sparkles className="w-4 h-4 text-indigo-400 group-hover/btn:scale-125 transition-transform" />
                   <span>{summarizing ? "Analyzing..." : "AI Intelligence"}</span>
                </button>
                <button onClick={downloadPDF} className="p-5 bg-white/5 hover:bg-white/10 text-white rounded-[24px] transition-all border border-white/5 hover:border-indigo-500/30">
                   <FileDown className="w-5 h-5" />
                </button>
                <button onClick={saveNote} disabled={saving} className="px-10 py-5 bg-white text-gray-950 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-20 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:bg-indigo-600 hover:text-white border border-transparent">
                   {saving ? "Syncing..." : "Finalize Node"}
                </button>
              </div>
            </div>

            <div className="flex-1 relative group p-10 md:p-16 min-h-0 overflow-hidden">
               <div className="absolute top-20 right-20 opacity-[0.02] pointer-events-none group-hover:scale-110 group-hover:opacity-10 transition-all duration-1000 grayscale">
                  <PenTool className="w-[500px] h-[500px] text-white rotate-6" />
               </div>
               
               <AnimatePresence mode="wait">
                  {!previewMode ? (
                    <motion.div 
                       key="edit"
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       exit={{ opacity: 0 }}
                       className="h-full relative z-10"
                    >
                      <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className="w-full h-full bg-transparent text-gray-200 text-[18px] leading-[1.8] outline-none resize-none font-medium custom-scrollbar placeholder:text-gray-800"
                        placeholder="Initialize knowledge stream..."
                        onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveNote(); } }}
                      />
                    </motion.div>
                  ) : (
                    <motion.div 
                       key="preview"
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       exit={{ opacity: 0 }}
                       className="h-full overflow-y-auto custom-scrollbar relative z-10 prose-custom rich-text"
                    >
                       {content ? (
                         <ReactMarkdown>{content}</ReactMarkdown>
                       ) : (
                         <p className="text-gray-700 italic font-medium">Node buffer empty. Input research data in edit mode.</p>
                       )}
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>
            
            <div className="px-16 py-8 border-t border-white/[0.03] bg-black/40 flex items-center justify-between">
               <div className="flex items-center space-x-6">
                 <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.5em]">Connection: Stable</p>
                 <div className="w-[1px] h-3 bg-white/5"></div>
                 <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.3em]">{content.split(/\s+/).filter(Boolean).length} Words Synced</p>
               </div>
               <div className="flex items-center text-[9px] font-black text-indigo-500/40 uppercase tracking-[0.5em]">
                  <Sparkles className="w-3 h-3 mr-3" /> Real-Time Brain v4.88
               </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center py-40 group relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-600/20 to-transparent"></div>
            <div className="w-32 h-32 bg-white/2 rounded-[48px] flex items-center justify-center mb-12 relative shadow-2xl group-hover:scale-110 transition-transform duration-700">
               <NotebookPen className="w-12 h-12 text-white/10 group-hover:text-indigo-600/50 transition-colors" />
               <div className="absolute inset-x-0 inset-y-0 border-2 border-dashed border-white/5 rounded-[48px] animate-[spin_30s_linear_infinite]"></div>
            </div>
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-6 group-hover:tracking-widest transition-all duration-700">SYNAPTIC DISCONNECT</h3>
            <p className="max-w-md mx-auto text-[10px] font-black text-gray-700 uppercase tracking-[0.4em] leading-relaxed mb-16 px-10">
               Establish a link with an existing research node or initialize a new sequence in the academic repository.
            </p>
            <button onClick={createNote} className="group relative px-16 py-6 bg-white text-gray-950 font-black rounded-[28px] active:scale-95 transition-all hover:bg-indigo-600 hover:text-white shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center gap-3 overflow-hidden border border-transparent">
               <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
               <span className="uppercase tracking-[0.4em] text-[10px]">Initialize Sequence</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
