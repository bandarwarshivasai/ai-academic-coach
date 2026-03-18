import Link from "next/link";
import { Brain } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-black text-white relative overflow-hidden flex flex-col items-center justify-center p-6">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse delay-1000"></div>

      <div className="relative z-10 text-center max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col items-center space-y-4 mb-8">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/20">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-indigo-400">AI Academic Assistant</p>
        </div>
        <h1 className="text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300 drop-shadow-lg">
          Master Your Academics
        </h1>
        <p className="text-xl text-indigo-200/80 max-w-2xl mx-auto font-light">
          Your personal academic coach. Track performance, get AI-powered predictions, personalized study plans, and generate smart learning materials from your notes. 
        </p>
        
        <div className="flex items-center justify-center space-x-6 pt-8">
          <Link href="/login" className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-xl transition shadow-xl text-lg font-semibold hover:-translate-y-1">
            Log In
          </Link>
          <Link href="/signup" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 backdrop-blur-xl transition shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)] text-lg font-bold hover:-translate-y-1">
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
}
