"use client";

import { useState, useRef, useEffect } from "react";
import { User, Send, StopCircle, BookOpen, Sparkles, Brain, X, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function AssistantPage() {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: "assistant", content: "Hello! I am your AI Academic Assistant. How can I help you with your studies today?" }
  ]);
  const [input, setInput] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = document.getElementById("ai-tutor-chat-container");
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const newMessages = [...messages, { role: "user", content: input }] as any;
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, subjectContext: subject }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...newMessages, { role: "assistant", content: data.response }]);
      } else {
        setMessages([...newMessages, { role: "assistant", content: "Failed to get a response from the AI. Please try again." }]);
      }
    } catch (error) {
       setMessages([...newMessages, { role: "assistant", content: "Connection error. Please check your internet and try again." }]);
    }
    
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-[1400px] mx-auto space-y-8 pb-4 px-4 overflow-hidden relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4 relative z-10">
        <div className="space-y-2">
          <div className="flex items-center space-x-4">
             <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30 rotate-3 hover:rotate-0 transition-transform duration-500">
                <Brain className="w-6 h-6 text-white" />
             </div>
             <div className="flex flex-col">
                <h1 className="text-3xl font-black text-white tracking-tighter italic">AI Tutor</h1>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mt-1">Smart Academic Assistant</span>
             </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 w-full md:w-auto group">
           <div className="flex items-center space-x-4 bg-white/5 border border-white/5 px-8 py-4 rounded-[32px] md:w-[450px] focus-within:border-indigo-500/30 focus-within:bg-black/20 transition-all shadow-inner backdrop-blur-3xl group/input">
              <Sparkles className="w-5 h-5 text-indigo-500/40 group-focus-within/input:text-indigo-400 transition-colors" />
              <input 
                 type="text" 
                 value={subject} 
                 onChange={(e) => setSubject(e.target.value)} 
                 placeholder="Set Subject Area..." 
                 className="bg-transparent border-none text-white outline-none w-full text-xs font-black uppercase tracking-[0.2em] placeholder:text-gray-800"
              />
           </div>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full bg-white/[0.02] border border-white/5 rounded-[40px] backdrop-blur-[100px] overflow-hidden flex flex-col shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative">
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-600/40 to-transparent"></div>
        <div className="absolute top-40 right-20 opacity-[0.02] pointer-events-none grayscale">
           <Brain className="w-[400px] h-[400px] text-white" />
        </div>
        
        <div id="ai-tutor-chat-container" className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 custom-scrollbar relative z-10">
          <AnimatePresence initial={false} mode="popLayout">
            {messages.map((message, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20, scale: 0.98 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className={`flex items-start gap-4 ${message.role === 'user' ? 'flex-row-reverse text-right' : ''}`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg relative border ${message.role === 'user' ? 'bg-indigo-600 border-white/20' : 'bg-white/5 border-white/10'}`}>
                  {message.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Brain className="w-5 h-5 text-indigo-400" />}
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[rgb(10,10,20)] ${message.role === 'user' ? 'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]' : 'bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]'}`}></div>
                </div>

                <div className={`max-w-[85%] md:max-w-[75%] rounded-[28px] px-6 py-5 text-sm md:text-base leading-relaxed shadow-2xl relative border transition-all duration-500 overflow-hidden ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-white/10 rounded-tr-sm' 
                    : 'bg-white/[0.04] text-gray-100 border-white/5 rounded-tl-sm hover:bg-white/[0.06]'
                }`}>
                   <div className="absolute top-0 right-0 p-4 opacity-5">
                      {message.role === 'user' ? <Sparkles className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
                   </div>
                   <div className="prose-custom rich-text relative z-10">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                   </div>
                   <div className={`absolute bottom-0 ${message.role === 'user' ? 'left-0' : 'right-0'} p-3 opacity-20 text-[8px] font-black uppercase tracking-[0.3em]`}>
                      {message.role === 'user' ? 'You' : 'AI Assistant'}
                   </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {loading && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white/1 border border-white/5 flex items-center justify-center shrink-0 shadow-inner animate-pulse">
                <Brain className="w-5 h-5 text-indigo-500/50" />
              </div>
              <div className="bg-white/5 border border-white/5 rounded-[28px] rounded-tl-sm px-6 py-5 flex items-center space-x-3 shadow-xl">
                 <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                 <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                 <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                 <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] ml-3 animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} className="h-4" />
        </div>

        <div className="p-6 md:p-8 bg-black/40 border-t border-white/[0.03] backdrop-blur-3xl relative z-20">
          <form onSubmit={sendMessage} className="flex space-x-4 max-w-5xl mx-auto items-center">
            <div className="flex-1 relative group">
               <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  disabled={loading}
                  placeholder="Ask a question..." 
                  className="w-full px-8 py-5 bg-white/5 border border-white/5 rounded-[28px] text-white outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all font-medium placeholder:text-gray-600 text-sm shadow-inner pr-16"
               />
               <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity duration-500">
                  <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
               </div>
            </div>
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white text-gray-950 hover:bg-indigo-600 hover:text-white shadow-[0_10px_20px_rgba(0,0,0,0.3)] transition-all active:scale-95 disabled:opacity-20 shrink-0 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {loading ? <StopCircle className="w-6 h-6 animate-pulse text-red-500 relative z-10" /> : <Send className="w-6 h-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform relative z-10" />}
            </button>
          </form>
          <div className="flex items-center justify-between mt-6 px-4">
             <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.4em]">AI Academic Assistant</p>
             <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                   <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Online</span>
                </div>
                <div className="w-[1px] h-3 bg-white/5"></div>
                <span className="text-[9px] font-black text-indigo-500/40 uppercase tracking-widest">{messages.length} Messages</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
