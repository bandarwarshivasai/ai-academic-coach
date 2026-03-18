"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, MessageSquare, Send, X, Sparkles, User, StopCircle, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function FloatingAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: "assistant", content: "I am your global Academic Intelligence link. How can I assist your research?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input } as const;
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg].slice(-10) }), // Context limit
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: "Failed to sync. Please try again." }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection lost. Please reconnect." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 p-6 bg-white text-gray-950 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95 transition-all group border border-white/20"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <Brain className="w-8 h-8 relative z-10" />
        <span className="absolute -top-14 right-0 bg-indigo-600 text-white text-[10px] font-black px-5 py-2.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/20 uppercase tracking-[0.2em] shadow-2xl">Initialize Assistant</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-gray-950/40 backdrop-blur-sm z-[80]"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 50, x: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0, x: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50, x: 50 }}
              className="fixed right-8 bottom-32 w-[90vw] md:w-[450px] h-[600px] bg-[rgb(10,10,25)] border border-white/10 rounded-[48px] z-[90] shadow-[0_30px_100px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600"></div>
              
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40">
                <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg relative">
                      <Bot className="w-6 h-6" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-indigo-900"></div>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">AI Assistant v1.4</span>
                      <span className="text-white font-bold text-sm">Academic Intelligence</span>
                   </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-3 bg-white/5 rounded-xl border border-white/5 text-gray-500 hover:text-white transition-all active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-gradient-to-b from-transparent to-black/20"
              >
                {messages.map((msg, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-5 rounded-[28px] text-sm leading-relaxed shadow-xl ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none border border-white/10' 
                        : 'bg-white/5 text-gray-200 rounded-tl-none border border-white/5'
                    }`}>
                       <div className="prose-custom rich-text text-sm">
                         <ReactMarkdown>
                            {msg.content}
                         </ReactMarkdown>
                       </div>
                    </div>
                  </motion.div>
                ))}
                {loading && (
                   <div className="flex justify-start">
                      <div className="bg-white/5 border border-white/5 p-4 rounded-2xl animate-pulse flex items-center space-x-2">
                         <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                         <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                         <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-300"></div>
                      </div>
                   </div>
                )}
              </div>

              <div className="p-8 border-t border-white/5 bg-black/40">
                  <form onSubmit={sendMessage} className="flex items-center space-x-3">
                    <div className="flex-1 relative group">
                       <input 
                         value={input}
                         onChange={(e) => setInput(e.target.value)}
                         placeholder="Sync question..."
                         className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-indigo-500 focus:bg-white/10 transition-all font-medium placeholder:text-gray-700 shadow-inner"
                       />
                       <Sparkles className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 opacity-20 group-focus-within:opacity-100 transition-opacity" />
                    </div>
                    <button 
                      type="submit"
                      disabled={loading || !input.trim()}
                      className="p-4 bg-white text-gray-950 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-20 active:scale-95 shadow-lg group"
                    >
                      <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                 </form>
                 <p className="text-[8px] font-black text-gray-800 uppercase tracking-[0.5em] text-center mt-6">Secure Connection: Active</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
