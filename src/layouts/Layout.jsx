import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Zap, BookOpen, Trophy, UserCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { settingsService } from "../api";

const Layout = () => {
  const location = useLocation();

  const { data: settings = {} } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await settingsService.get();
      return res.data || {};
    }
  });

  const studentEmail = localStorage.getItem('super40_student_email');
  const isDirectMode = settings.direct_exam_mode === 'true';
  const hasRegistered = !!studentEmail;

  const navLinks = [
    { path: "/", label: "Register", icon: UserCheck },
    ...(hasRegistered && !isDirectMode ? [{ path: "/super40/exams", label: "Exams Lobby", icon: BookOpen }] : []),
    { path: "/super40/results", label: "Check Results", icon: Trophy },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      {/* Premium Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-900/10 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-blue-400 fill-blue-400" />
            </div>
            <div>
              <span className="text-lg font-black text-slate-900 tracking-tighter uppercase">Super 40</span>
              <span className="block text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none">Evaluation Suite</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                    isActive 
                      ? "bg-white text-blue-900 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Button spacer */}
          <div className="w-10"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Premium Footer */}
      <footer className="bg-white border-t border-slate-100 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">&copy; 2026 Super 40 Entrance Evaluation Portal. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            {hasRegistered && !isDirectMode && (
              <Link to="/super40/exams" className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">Exams</Link>
            )}
            <Link to="/super40/results" className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">Results</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
