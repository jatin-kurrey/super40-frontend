import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck, ArrowRight, Key, Sparkles } from 'lucide-react';
import { authService } from '../api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Silent database seeding/initialization check on mount
    const initDatabase = async () => {
      try {
        await authService.init('admin');
      } catch (err) {
        // Ignored if already initialized
        console.log('Database initialization check complete');
      }
    };
    initDatabase();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login({ username, password });
      localStorage.setItem('super40_admin_token', response.data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofill = () => {
    setUsername('admin');
    setPassword('super40_admin_2026');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-[440px] relative z-10 space-y-6">
        <div className="bg-white border border-slate-200 p-10 md:p-12 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-sm">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-blue-900 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-900/10 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Portal Access</h1>
            <p className="text-slate-500 font-medium">Super 40 Administrative Panel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-semibold text-center animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 focus:bg-white transition-all font-medium"
                  placeholder="admin_username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 focus:bg-white transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full py-4 bg-blue-900 hover:bg-blue-800 text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Private Administrative System
            </p>
          </div>
        </div>

        {/* Premium Credentials Panel */}
        <div className="bg-slate-900/5 border border-slate-200/60 p-6 rounded-[2rem] backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Key className="w-4 h-4 text-blue-900" />
              <span className="text-xs font-black uppercase text-slate-700 tracking-wider">Demo / Test Access</span>
            </div>
            <button
              type="button"
              onClick={handleAutofill}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-full text-[11px] font-black tracking-wider uppercase transition-all duration-300 shadow-md shadow-blue-900/10 active:scale-95 flex items-center justify-center"
            >
              <Sparkles className="w-3 h-3" />
              <span>Autofill Credentials</span>
            </button>
          </div>

          <div className="bg-white/80 border border-slate-100 p-4 rounded-2xl font-semibold text-xs text-slate-800">
            <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px] mb-1.5">Super Admin Account</p>
            <div className="flex flex-col gap-1.5">
              <p>Username: <span className="font-black text-blue-900">admin</span></p>
              <p>Password: <span className="font-black text-blue-900">super40_admin_2026</span></p>
            </div>
          </div>
        </div>
        
        <p className="text-center text-slate-400 text-sm font-medium">
          &copy; 2026 Krishna Engineering College. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
