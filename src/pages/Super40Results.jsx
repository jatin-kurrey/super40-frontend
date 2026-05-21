import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Mail, 
  Phone, 
  ArrowRight, 
  Lock,
  FileText,
  Calendar,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  User
} from 'lucide-react';
import { examService } from '../api';

const Super40Results = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    phone: ''
  });
  const [results, setResults] = useState(null);

  const { mutate: triggerLookup, isLoading: loading, error: mutationError } = useMutation({
    mutationFn: async ({ email, phone }) => {
      const trimmedEmail = email.toLowerCase().trim();
      const trimmedPhone = phone.trim();
      const res = await examService.getResults(trimmedEmail, trimmedPhone);
      // Robust data extraction
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    },
    onSuccess: (data) => {
      console.log("Results fetched successfully:", data);
      setResults(data);
    }
  });

  const handleLookup = (e) => {
    if (e) e.preventDefault();
    triggerLookup({ email: credentials.email, phone: credentials.phone });
  };

  // Auto-fill and auto-submit if credentials exist in localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('super40_student_email');
    const savedPhone = localStorage.getItem('super40_student_phone');
    if (savedEmail && savedPhone) {
      const emailVal = savedEmail.toLowerCase().trim();
      const phoneVal = savedPhone.trim();
      setCredentials({ email: emailVal, phone: phoneVal });
      triggerLookup({ email: emailVal, phone: phoneVal });
    }
  }, [triggerLookup]);

  const error = mutationError?.response?.data?.error || mutationError?.message;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 px-6">
      {/* Decorative BG */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-blue-900/5 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {!results ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="max-w-xl mx-auto"
          >
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-blue-900 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-900/20 transform -rotate-6">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Evaluation Portal</h1>
              <p className="text-slate-500 font-medium">Enter your registered credentials to access your Super 40 examination results.</p>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-[0_8px_40px_rgba(0,0,0,0.03)]">
              <form onSubmit={handleLookup} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      type="email"
                      required
                      placeholder="Enter registered email"
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-900"
                      value={credentials.email}
                      onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      type="tel"
                      required
                      placeholder="Enter registered phone"
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-900"
                      value={credentials.phone}
                      onChange={(e) => setCredentials({...credentials, phone: e.target.value})}
                    />
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-bold"
                  >
                    <AlertCircle className="w-5 h-5" />
                    {error}
                  </motion.div>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-blue-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Retrieve Results"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
              <div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full mb-6"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Authenticated Access</span>
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="text-5xl font-black text-slate-900 tracking-tighter"
                >
                  Welcome, <span className="text-blue-900">{results[0]?.name || "Student"}</span>
                </motion.h1>
              </div>
              <motion.button 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                onClick={() => {
                  setResults(null);
                }}
                className="text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2"
              >
                Change Credentials <TrendingUp className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Profile Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:col-span-1"
              >
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 border border-slate-100">
                    <User className="w-12 h-12 text-slate-300" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-6">Profile Details</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email</p>
                      <p className="font-bold text-slate-900">{credentials.email}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                      <p className="font-bold text-slate-900">{credentials.phone}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Score List */}
              <div className="lg:col-span-2 space-y-8">
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Exam Performances
                </h2>

                {results.length === 0 ? (
                  <div className="bg-white p-16 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
                    <p className="text-slate-400 font-bold">No exam responses found for this account.</p>
                  </div>
                ) : (
                  results.map((result, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 + idx * 0.1 }}
                      className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex gap-6 items-center">
                          <div className="w-16 h-16 bg-blue-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-900/20 group-hover:rotate-6 transition-transform">
                            <Trophy className="w-8 h-8" />
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-slate-900 mb-1">{result.exam_title || "Super 40 Evaluation"}</h3>
                            <div className="flex items-center gap-3 text-slate-400">
                              <Calendar className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">
                                {new Date(result.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-8 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                          <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">Submitted</span>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Final Score</p>
                            <p className="text-3xl font-black text-blue-900 tracking-tighter">{result.score}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Super40Results;
