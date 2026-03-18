"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  BookOpen, LineChart, FileText, Brain, LogOut, LayoutDashboard, Target, 
  Settings, Activity, Calendar, Zap, NotebookPen, Flame, Menu, X, Cpu, Sparkles 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className="text-indigo-300 font-medium">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Subjects", href: "/dashboard/subjects", icon: BookOpen },
    { name: "Parameters", href: "/dashboard/parameters", icon: Activity },
    { name: "Predictions", href: "/dashboard/predictions", icon: Target },
    { name: "Study Plan", href: "/dashboard/study-plan", icon: Calendar },
    { name: "AI Assistant", href: "/dashboard/assistant", icon: Brain },
    { name: "Documents", href: "/dashboard/documents", icon: FileText },
    { name: "Quizzes", href: "/dashboard/quiz", icon: Zap },
    { name: "Notes", href: "/dashboard/notes", icon: NotebookPen },
    { name: "Study Streak", href: "/dashboard/streak", icon: Flame },
    { name: "Analytics", href: "/dashboard/analytics", icon: LineChart },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const bottomNavItems = [
    { name: "Home", href: "/dashboard", icon: LayoutDashboard },
    { name: "Chat", href: "/dashboard/assistant", icon: Brain },
    { name: "Docs", href: "/dashboard/documents", icon: FileText },
    { name: "Streak", href: "/dashboard/streak", icon: Flame },
    { name: "More", href: "#", icon: Menu, onClick: () => setIsMobileMenuOpen(true) },
  ];

  return (
    <div className="min-h-screen flex bg-gray-950 text-white selection:bg-indigo-500/30 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-[rgb(5,5,15)]/80 border-r border-white/5 flex flex-col hidden lg:flex relative z-30 backdrop-blur-3xl shrink-0">
        <div className="h-24 flex items-center px-8 border-b border-white/5">
          <div className="p-2.5 bg-indigo-600 rounded-xl mr-4 shadow-[0_0_20px_rgba(79,70,229,0.4)]">
             <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight text-white uppercase tracking-[0.1em]">
               Academic
            </span>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] opacity-80">Assistant</span>
          </div>
        </div>
        
        <nav className="flex-1 py-10 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em] mb-6 px-4">Workspace Control</p>
          {navItems.map((item) => {
            const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3.5 px-5 py-3 rounded-2xl transition-all duration-300 group ${
                  isActive
                    ? "sidebar-active"
                    : "text-gray-500 hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                <item.icon className={`w-4 h-4 transition-colors duration-300 ${isActive ? "text-indigo-400" : "group-hover:text-indigo-400"}`} />
                <span className={`text-[11px] font-bold uppercase tracking-wider transition-all ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-6 border-t border-white/5 bg-black/20">
          <div className="flex items-center space-x-4 p-4 bg-white/[0.02] rounded-2xl mb-4 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-black text-white shadow-lg">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-white truncate uppercase tracking-wide">{session?.user?.name}</p>
              <div className="flex items-center space-x-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                 <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Active</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center justify-center space-x-3 px-4 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-xl text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-95 border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[rgb(2,2,7)]">
        {/* Mobile Header */}
        <header className="lg:hidden h-20 border-b border-white/[0.05] bg-black/60 backdrop-blur-3xl flex items-center justify-between px-6 z-40 shrink-0">
          <div className="flex items-center space-x-3">
             <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">
                <Brain className="w-5 h-5 text-white" />
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Academic</span>
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-[0.3em]">Assistant</span>
             </div>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-3 bg-white/5 rounded-xl border border-white/5 text-indigo-400 active:scale-90 transition-all shadow-xl"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 xl:p-10 relative custom-scrollbar pb-32 lg:pb-10">
          <div className="relative z-20 w-full max-w-[1400px] mx-auto">
            {children}
          </div>
        </div>

        {/* Mobile Bottom Tab Bar */}
        <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-20 bg-black/40 backdrop-blur-3xl border border-white/[0.05] rounded-[32px] px-2 flex items-center justify-around z-40 shadow-2xl overflow-hidden shadow-purple-500/5">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-50"></div>
          {bottomNavItems.map((item) => {
            const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
            return (
              <button
                key={item.name}
                onClick={item.onClick || (() => router.push(item.href))}
                className={`relative z-10 flex flex-col items-center justify-center space-y-1 w-full h-full transition-all duration-500 ${
                  isActive ? "text-purple-400" : "text-gray-500"
                }`}
              >
                <item.icon className={`w-5 h-5 transition-all duration-300 ${isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]" : "opacity-60"}`} />
                <span className="text-[9px] font-black uppercase tracking-tighter">{item.name}</span>
                {isActive && (
                    <motion.div layoutId="mobile-dot" className="absolute -bottom-1 w-1 h-1 bg-purple-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </main>

      {/* Mobile Sidebar Overlay (Drawer) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-black border-l border-white/[0.05] z-[60] flex flex-col lg:hidden shadow-3xl"
            >
              <div className="h-24 flex items-center justify-between px-8 border-b border-white/[0.05]">
                <div className="flex items-center space-x-3">
                   <div className="p-2 bg-indigo-600 rounded-lg">
                      <Brain className="w-4 h-4 text-white" />
                   </div>
                   <span className="text-xs font-bold uppercase tracking-wider text-white">AI Academic Assistant</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-3 bg-white/5 rounded-2xl border border-white/5 text-gray-400 active:scale-90 transition-transform"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <nav className="flex-1 py-10 px-6 space-y-2 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => {
                  const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-4 px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] rounded-[24px] transition-all relative ${
                        isActive
                          ? "bg-white/5 text-white border border-white/5 shadow-xl"
                          : "text-gray-500 hover:text-white"
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${isActive ? "text-purple-400" : ""}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
              
              <div className="p-8 border-t border-white/[0.05] bg-black">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="flex w-full items-center justify-center space-x-3 px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] rounded-[24px] bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
