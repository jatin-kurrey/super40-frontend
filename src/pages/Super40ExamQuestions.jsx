import React, { useRef, useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { examService, settingsService } from "../api";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Eye, Loader2, FileText, TrendingUp, Calendar, AlertCircle } from "lucide-react";

const Super40ExamQuestions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [currentSubject, setCurrentSubject] = useState('');
  const [markedForReview, setMarkedForReview] = useState({});

  const { data: settings = {}, isLoading: loadingSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await settingsService.get();
      return res.data || {};
    }
  });

  const { data: examData, isLoading: loading } = useQuery({
    queryKey: ['exam-details', id],
    queryFn: async () => {
      const res = await examService.getDetails(id);
      return res.data;
    },
    enabled: !!id,
    onError: (err) => {
      console.error("Fetch Exam Error:", err);
      alert("Exam not found or unavailable.");
      navigate('/super40/exams');
    }
  });

  const getExamSlotState = () => {
    if (loadingSettings) return { state: "loading" };
    if (!settings.exam_date || !settings.exam_start_time || !settings.exam_end_time) {
      return { state: "open" };
    }

    const now = new Date();
    const [year, month, day] = settings.exam_date.split('-').map(Number);
    const [startHour, startMin] = settings.exam_start_time.split(':').map(Number);
    const [endHour, endMin] = settings.exam_end_time.split(':').map(Number);

    const startDateTime = new Date(year, month - 1, day, startHour, startMin, 0);
    const endDateTime = new Date(year, month - 1, day, endHour, endMin, 0);

    if (now < startDateTime) {
      return { state: "upcoming", start: startDateTime };
    } else if (now > endDateTime) {
      return { state: "closed", end: endDateTime };
    }
    return { state: "open", end: endDateTime };
  };

  const slotStatus = getExamSlotState();

  const questions = examData?.questions || [];
  const subjects = questions.length > 0 ? [...new Set(questions.map(q => q.subject || 'General'))] : [];
  const exam = examData;
  
  useEffect(() => {
    if (subjects.length > 0 && !currentSubject) {
      setCurrentSubject(subjects[0]);
    }
  }, [subjects, currentSubject]);

  const filteredQuestions = (exam?.questions || []).filter(q => (q.subject || 'General') === currentSubject);

  const toggleMarkForReview = (questionId) => {
    setMarkedForReview(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  useEffect(() => {
    if (examData) {
      setTimeLeft(examData.duration * 60);
    }
  }, [examData]);

  // Timer countdown
  useEffect(() => {
    if (!examStarted || timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, examStarted]);

  const handleChange = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleAutoSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const email = (localStorage.getItem('super40_student_email') || 'anonymous').toLowerCase().trim();
    
    try {
      const payload = {
        exam_id: exam.id,
        student_id: email,
        name: localStorage.getItem('super40_student_name') || 'Student',
        responses: answers,
        submitted: true
      };
      await examService.submitResponse(payload);
      alert("Time's up! Your exam has been submitted automatically.");
      navigate('/super40/results');
    } catch (err) {
      console.error("Auto Submit Error:", err);
      alert("Time's up! Your exam auto-submission had an issue, but we are navigating you to results. Please verify your exam completion.");
      navigate('/super40/results');
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, exam, isSubmitting, navigate]);

  useEffect(() => {
    if (timeLeft === 0 && !isSubmitting && examStarted) {
      handleAutoSubmit();
    }
  }, [timeLeft, isSubmitting, handleAutoSubmit, examStarted]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!window.confirm("Are you sure you want to submit your exam?")) return;
    
    setIsSubmitting(true);
    const email = (localStorage.getItem('super40_student_email') || 'anonymous').toLowerCase().trim();
    
    try {
      const payload = {
        exam_id: exam.id,
        student_id: email,
        name: localStorage.getItem('super40_student_name') || 'Student',
        responses: answers,
        submitted: true
      };
      
      await examService.submitResponse(payload);
      alert("Exam submitted successfully!");
      navigate('/super40/results');
    } catch (err) {
      console.error("Submit Error:", err);
      alert("Failed to submit exam. Please try again.");
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    if (seconds === null) return "00:00";
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (loading || loadingSettings) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 text-blue-900 animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Initializing Secure Session...</p>
    </div>
  );
  
  if (slotStatus.state === "upcoming") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_40px_rgba(0,0,0,0.02)] text-center space-y-6 animate-in fade-in">
          <div className="w-20 h-20 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Calendar className="w-8 h-8 text-blue-900" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter mb-2 uppercase tracking-wide">Exam Window Not Open</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              This entrance assessment is scheduled to take place on:
            </p>
            <p className="text-blue-900 font-black text-lg mt-4 bg-blue-50 px-6 py-3 rounded-xl inline-block border border-blue-100">
              {new Date(slotStatus.start).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} • {settings.exam_start_time}
            </p>
          </div>
          <button onClick={() => navigate('/super40/exams')} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-wider text-xs">
            Return to Portal
          </button>
        </div>
      </div>
    );
  }

  if (slotStatus.state === "closed") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_40px_rgba(0,0,0,0.02)] text-center space-y-6 animate-in fade-in">
          <div className="w-20 h-20 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter mb-2 uppercase tracking-wide">Exam Window Concluded</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              The scheduled time slot for this assessment has concluded.
            </p>
          </div>
          <button onClick={() => navigate('/super40/exams')} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-wider text-xs">
            Return to Portal
          </button>
        </div>
      </div>
    );
  }

  if (!exam) return <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-widest text-slate-400">Protocol Error: Exam Not Found</div>;

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full bg-white p-16 rounded-[3rem] border border-slate-100 shadow-[0_20px_80px_rgba(0,0,0,0.04)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 bg-blue-900 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-900/20">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Entrance Evaluation</p>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{exam.title}</h2>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mb-10">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Candidacy Instructions</h4>
              <p className="text-slate-600 leading-relaxed font-medium">{exam.description || "No specific instructions provided. Please ensure a stable internet connection."}</p>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-12">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Duration</p>
                <p className="text-xl font-black text-slate-900">{exam.duration}m</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Questions</p>
                <p className="text-xl font-black text-slate-900">{questions.length}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Integrity</p>
                <p className="text-xl font-black text-emerald-600">Secure</p>
              </div>
            </div>

            <button 
              onClick={() => setExamStarted(true)}
              className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-900 transition-all shadow-2xl shadow-slate-900/20 hover:-translate-y-1 duration-500"
            >
              Commence Examination
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Precision Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-8 py-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-white font-black text-xs">S</div>
          <div>
            <h1 className="text-sm font-black text-slate-900 tracking-tighter uppercase tracking-[0.05em]">{exam.title}</h1>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Secure Session Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-10">
          <div className="hidden lg:flex items-center gap-3 bg-slate-50 px-6 py-2.5 rounded-2xl border border-slate-100">
            <Clock className={`w-4 h-4 ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-blue-900'}`} />
            <span className={`text-lg font-black tracking-tight tabular-nums ${timeLeft < 300 ? 'text-red-600' : 'text-slate-900'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-red-500 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
          >
            Final Submission
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Examination Column */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Subject Tabs */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-[1.5rem] border border-slate-100 shadow-sm sticky top-0 z-40">
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setCurrentSubject(sub)}
                  className={`flex-1 py-3 px-6 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] transition-all ${
                    currentSubject === sub 
                      ? 'bg-blue-900 text-white shadow-xl shadow-blue-900/20' 
                      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            {/* Questions Container */}
            <div className="space-y-10 pb-20">
              {filteredQuestions.map((q) => {
                const globalIndex = questions.findIndex(item => item.id === q.id);
                return (
                  <motion.div 
                    key={q.id}
                    id={`question-${q.id}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`bg-white rounded-[2.5rem] p-10 border transition-all duration-500 relative ${
                      markedForReview[q.id] ? 'border-amber-200 shadow-lg shadow-amber-500/5' : 'border-slate-100 shadow-sm'
                    }`}
                  >
                    {markedForReview[q.id] && (
                      <div className="absolute top-0 right-10 -translate-y-1/2 bg-amber-500 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                        Marked for Review
                      </div>
                    )}

                    <div className="flex items-start gap-6 mb-8">
                      <div className="flex flex-col items-center gap-1">
                        <span className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-xl">
                          {globalIndex + 1}
                        </span>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Query</span>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest px-3 py-1 bg-blue-50 rounded-lg">{q.subject}</span>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                            q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600' :
                            q.difficulty === 'Hard' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                          }`}>{q.difficulty}</span>
                        </div>
                        <p className="text-xl font-black text-slate-900 tracking-tight leading-tight">{q.text}</p>
                      </div>
                    </div>

                    {q.image_url && (
                      <div className="mb-10 rounded-3xl overflow-hidden border border-slate-100 bg-white p-6 shadow-inner group cursor-zoom-in">
                        <img 
                          src={q.image_url.startsWith('http') ? q.image_url : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'}${q.image_url}`} 
                          alt="Evaluation Visual" 
                          className="max-h-[400px] w-full object-contain mx-auto group-hover:scale-[1.02] transition-transform duration-700"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.type === 'MCQ' ? (
                        q.options.map((opt, oIdx) => (
                          <label 
                            key={oIdx}
                            className={`group flex items-center gap-5 p-5 rounded-[1.5rem] cursor-pointer border-2 transition-all duration-300 ${
                              answers[q.id] === opt 
                                ? 'bg-blue-50 border-blue-900 shadow-lg shadow-blue-900/5' 
                                : 'bg-white border-slate-50 hover:border-slate-200'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-black text-xs transition-all ${
                              answers[q.id] === opt ? 'bg-blue-900 border-blue-900 text-white' : 'bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-white group-hover:border-slate-300'
                            }`}>
                              {String.fromCharCode(65 + oIdx)}
                            </div>
                            <span className={`font-bold text-[15px] ${answers[q.id] === opt ? 'text-blue-900' : 'text-slate-600'}`}>
                              {opt}
                            </span>
                            <input
                              type="radio"
                              name={`question-${q.id}`}
                              value={opt}
                              checked={answers[q.id] === opt}
                              onChange={(e) => handleChange(q.id, opt, e)}
                              className="hidden"
                            />
                          </label>
                        ))
                      ) : (
                        <div className="col-span-2">
                          <input 
                            type="text"
                            placeholder="Type numerical response..."
                            className="w-full max-w-md p-6 bg-slate-50 border-2 border-transparent focus:border-blue-900 focus:bg-white rounded-3xl outline-none font-black text-2xl text-blue-900 transition-all placeholder:text-slate-300 placeholder:text-sm"
                            value={answers[q.id] || ''}
                            onChange={(e) => handleChange(q.id, e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                      <button 
                        type="button"
                        onClick={() => toggleMarkForReview(q.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${
                          markedForReview[q.id] ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {markedForReview[q.id] ? 'Marked for Review' : 'Mark for Review'}
                      </button>
                      
                      {answers[q.id] && (
                        <button 
                          type="button"
                          onClick={() => handleChange(q.id, undefined)}
                          className="text-slate-400 hover:text-red-500 font-black text-[9px] uppercase tracking-widest px-4 py-2 transition-colors"
                        >
                          Clear Response
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Lateral Navigation Sidebar (Question Palette) */}
        <aside className="w-[380px] bg-white border-l border-slate-100 flex flex-col p-8 hidden xl:flex">
          <div className="mb-10">
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Evaluation Matrix
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[18px] font-black text-slate-900 tabular-nums leading-none">
                  {Object.keys(answers).filter(id => answers[id]).length}
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Answered</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[18px] font-black text-slate-900 tabular-nums leading-none">
                  {Object.keys(markedForReview).filter(id => markedForReview[id]).length}
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Reviewing</p>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question Navigator</h4>
              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">{currentSubject}</span>
            </div>
            
            <div className="grid grid-cols-5 gap-3">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isReview = markedForReview[q.id];
                const isCurrentSubject = (q.subject || 'General') === currentSubject;

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentSubject(q.subject || 'General');
                      setTimeout(() => {
                        document.getElementById(`question-${q.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
                    }}
                    className={`w-full aspect-square rounded-xl flex items-center justify-center text-xs font-black transition-all border-2 ${
                      isReview ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20' :
                      isAnswered ? 'bg-blue-900 border-blue-900 text-white shadow-lg shadow-blue-900/20' :
                      isCurrentSubject ? 'bg-white border-blue-100 text-blue-900 hover:border-blue-900' :
                      'bg-slate-50 border-transparent text-slate-300 hover:border-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-auto space-y-4 pt-8 border-t border-slate-50">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-900 rounded-sm"></div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Answered Successfully</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-amber-500 rounded-sm"></div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Marked for Review</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-white border border-slate-100 rounded-sm"></div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Unanswered Query</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
    </div>
  );
};

export default Super40ExamQuestions;
