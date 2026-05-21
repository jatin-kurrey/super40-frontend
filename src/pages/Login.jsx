import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { authService } from '../api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-[440px] relative z-10">
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

          {/* Quick Autofill Helper */}
          <div className="mt-8 p-5 bg-blue-50/50 border border-blue-100 rounded-2xl animate-in fade-in duration-500">
            <div className="flex items-center gap-2 text-blue-900 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-wider">Demo / Test Account</span>
            </div>
            <div className="text-xs font-semibold text-slate-600 mb-3 space-y-1">
              <div>Username: <code className="bg-white px-2 py-0.5 border border-blue-100 rounded text-blue-900 font-bold">admin</code></div>
              <div>Password: <code className="bg-white px-2 py-0.5 border border-blue-100 rounded text-blue-900 font-bold">super40_admin_2026</code></div>
            </div>
            <button
              type="button"
              onClick={() => {
                setUsername('admin');
                setPassword('super40_admin_2026');
              }}
              className="w-full py-2.5 bg-blue-900 text-white hover:bg-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm cursor-pointer"
            >
              Autofill Credentials
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Private Administrative System
            </p>
          </div>
        </div>
        
        <p className="mt-8 text-center text-slate-400 text-sm font-medium">
          &copy; 2026 Krishna Engineering College. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
