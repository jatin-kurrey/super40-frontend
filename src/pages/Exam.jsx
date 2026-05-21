import React from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  Trophy, 
  BookOpen, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Calendar,
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Exam = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-blue-950 text-white px-6 py-2 rounded-full mb-8 shadow-xl shadow-blue-900/20">
              <Zap className="w-4 h-4 text-blue-400 fill-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Institutional Evaluation</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-tight">
              Super 40 <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">
                Examination 2026
              </span>
            </h1>
            
            <p className="text-xl text-slate-500 font-medium leading-relaxed mb-12">
              The definitive entrance portal for high-performing students. Secure your spot in our most prestigious programs through a comprehensive evaluation designed to identify the next generation of engineering leaders.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={() => navigate('/apply')}
                className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/20 transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                Register Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => navigate('/super40/exams')}
                className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100 text-slate-900 px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] border border-slate-200 transition-all duration-300 flex items-center justify-center gap-3"
              >
                Enter Exam Portal
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 -mt-10 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Duration", value: "120 Mins", icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Total Marks", value: "400", icon: Award, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Seats", value: "Top 40", icon: Trophy, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Questions", value: "100 MCQ", icon: ClipboardList, color: "text-indigo-600", bg: "bg-indigo-50" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_40px_rgba(0,0,0,0.02)] flex flex-col items-center text-center group hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
              >
                <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center mb-4 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500`}>
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</span>
                <span className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            {/* Exam Details */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-1 bg-blue-700 rounded-full"></div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Examination Structure</h2>
              </div>
              
              <div className="space-y-8">
                {[
                  {
                    title: "Mathematics & Analytical Ability",
                    desc: "Focusing on logical reasoning, problem-solving, and advanced mathematical concepts relevant to engineering.",
                    marks: "150 Marks"
                  },
                  {
                    title: "Science & Technology",
                    desc: "Comprehensive evaluation of Physics, Chemistry, and emerging technology trends.",
                    marks: "150 Marks"
                  },
                  {
                    title: "Language & Proficiency",
                    desc: "Testing communication skills and comprehensive ability essential for global careers.",
                    marks: "100 Marks"
                  }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    variants={itemVariants}
                    className="flex gap-6 p-8 bg-white rounded-[2rem] border border-slate-100 hover:border-blue-100 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 font-black group-hover:bg-blue-900 group-hover:text-white transition-all duration-300">
                      0{idx + 1}
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                        <span className="text-blue-700 font-black text-[10px] uppercase tracking-widest">{item.marks}</span>
                      </div>
                      <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Important Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-blue-950 rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
              
              <div className="relative z-10">
                <h2 className="text-3xl font-black mb-10 tracking-tighter uppercase flex items-center gap-4">
                  <Info className="w-8 h-8 text-blue-400" />
                  Key Instructions
                </h2>
                
                <div className="space-y-8 mb-12">
                  {[
                    "Students must bring a valid Government ID and their Admit Card.",
                    "The examination will be conducted in a secure online environment.",
                    "Negative marking of 1/4th for every incorrect MCQ response.",
                    "Late entry will not be permitted after 15 minutes of commencement.",
                    "Calculators and other electronic devices are strictly prohibited."
                  ].map((info, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                      <p className="text-blue-100/80 font-medium leading-relaxed">{info}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white/10 rounded-[2rem] p-8 backdrop-blur-md border border-white/10">
                  <div className="flex items-center gap-4 mb-6 text-blue-400">
                    <Calendar className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Upcoming Cycle</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-white/5 pb-3">
                      <span className="text-white/60 font-medium">Registration Ends</span>
                      <span className="font-black">Oct 15, 2025</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-3">
                      <span className="text-white/60 font-medium">Admit Card Release</span>
                      <span className="font-black">Oct 20, 2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60 font-medium">Examination Date</span>
                      <span className="font-black text-blue-400">Oct 28, 2025</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <BookOpen className="w-16 h-16 text-blue-500 mx-auto mb-8" />
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tighter">
            Need Assistance?
          </h2>
          <p className="text-slate-400 text-lg font-medium mb-12 max-w-2xl mx-auto">
            Our admission and examination helpdesk is available to assist you with any technical or procedural queries regarding the Super 40 examination.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a href="mailto:exams@kecbhilai.edu.in" className="w-full sm:w-auto bg-white text-slate-900 px-10 py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-50 transition-colors">
              Email Support
            </a>
            <a href="tel:+917882286662" className="w-full sm:w-auto bg-blue-700 text-white px-10 py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-colors">
              Call Helpline
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Exam;
