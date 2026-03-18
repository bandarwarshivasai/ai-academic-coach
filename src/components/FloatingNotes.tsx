"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NotebookPen, X, Plus, Save, Sparkles, Trash2, ChevronLeft, ChevronRight, PenTool } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function FloatingNotes() {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotes();
    }
  }, [isOpen]);

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/notes");
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const createNote = async () => {
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Note", content: "" }),
      });
      if (res.ok) {
        const data = await res.json();
        await fetchNotes();
        selectNote(data.note);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const selectNote = (note: any) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  const saveNote = async () => {
    if (!selectedNote) return;
    setLoading(true);
    try {
      await fetch(`/api/notes/${selectedNote._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      await fetchNotes();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-32 right-8 z-50 p-5 bg-indigo-600 text-white rounded-[24px] shadow-2xl shadow-indigo-600/40 hover:scale-110 active:scale-95 transition-all border border-indigo-400/20 group"
      >
        <NotebookPen className="w-6 h-6" />
        <span className="absolute -top-12 right-0 bg-gray-950 text-white text-[10px] font-black px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 uppercase tracking-widest">Toggle Notepad</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full lg:w-[600px] bg-[rgb(5,5,15)] border-l border-white/5 z-[70] shadow-3xl flex flex-col"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
              
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40">
                <div className="flex items-center space-x-4">
                   <div className="p-3 bg-indigo-600 text-white rounded-xl">
                      <NotebookPen className="w-5 h-5" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Quick Notes</span>
                      <span className="text-white font-bold text-sm tracking-tight">Academic Brainstorming</span>
                   </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-3 bg-white/5 rounded-xl border border-white/5 text-gray-400 hover:text-white transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* Side List */}
                <div className="w-72 border-r border-white/5 flex flex-col p-6 space-y-4 bg-black/20 overflow-y-auto custom-scrollbar">
                   <button 
                     onClick={createNote}
                     className="w-full p-4 bg-white/[0.03] border border-white/5 text-white rounded-[20px] flex items-center justify-between hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest group"
                   >
                     <span>New Node</span>
                     <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                   </button>
                   
                   <div className="space-y-2">
                      {notes.map((note) => (
                        <button 
                          key={note._id}
                          onClick={() => selectNote(note)}
                          className={`w-full p-5 rounded-[24px] text-left transition-all border ${selectedNote?._id === note._id ? 'bg-indigo-600 text-white border-transparent' : 'bg-white/2 bg-transparent text-gray-500 border-transparent hover:border-white/10'}`}
                        >
                          <p className="text-xs font-black truncate">{note.title || "Untitled"}</p>
                          <p className="text-[9px] mt-1 opacity-60 uppercase tracking-widest">{new Date(note.updatedAt).toLocaleDateString()}</p>
                        </button>
                      ))}
                   </div>
                </div>

                {/* Editor */}
                <div className="flex-1 flex flex-col p-8 bg-black/10 relative overflow-hidden">
                   {selectedNote ? (
                     <>
                        <div className="mb-8">
                           <input 
                             value={title}
                             onChange={(e) => setTitle(e.target.value)}
                             placeholder="Note Title..."
                             className="w-full bg-transparent text-3xl font-black text-white outline-none tracking-tight focus:text-indigo-400 transition-all placeholder:text-gray-800"
                           />
                        </div>
                        <div className="flex-1 relative">
                           <textarea 
                             value={content}
                             onChange={(e) => setContent(e.target.value)}
                             placeholder="Start capturing insights..."
                             className="w-full h-full bg-transparent text-gray-300 text-lg leading-relaxed outline-none resize-none custom-scrollbar placeholder:text-gray-800"
                           />
                        </div>
                        <div className="pt-8 flex items-center justify-between">
                            <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em]">Synced Real-Time</p>
                            <button 
                              onClick={saveNote}
                              disabled={loading}
                              className="px-8 py-3 bg-white text-gray-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-20 shadow-2xl"
                            >
                              {loading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                     </>
                   ) : (
                     <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20">
                        <PenTool className="w-20 h-20 mb-8" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Select a node to begin</p>
                     </div>
                   )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
