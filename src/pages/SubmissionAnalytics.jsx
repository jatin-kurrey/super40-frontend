import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowLeft,
  User,
  Activity,
  HelpCircle
} from 'lucide-react';
import { examService } from '../api';

const SubmissionAnalytics = ({ responseId, onBack }) => {
  const { data, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['submission-analytics', responseId],
    queryFn: async () => {
      const res = await examService.getDetailedResponse(responseId);
      return res.data;
    },
    enabled: !!responseId
  });

  const error = queryError?.response?.data?.error || queryError?.message;

  if (loading) return (
    <div className="p-20 text-center">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-slate-500 font-bold">Analyzing Submission...</p>
    </div>
  );

  if (!data) return (
    <div className="p-20 text-center">
      <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-100">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>
      <h3 className="text-slate-900 font-black uppercase tracking-tighter text-xl">Submission Not Found</h3>
      <p className="text-slate-400 text-sm font-medium mb-2">The requested exam response could not be retrieved from the system.</p>
      <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mb-8 bg-red-50 px-4 py-2 rounded-lg inline-block border border-red-100">{error}</p>
      <br />
      <button 
        onClick={onBack}
        className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
      >
        Go Back
      </button>
    </div>
  );

  const { response, exam } = data;
  const studentResponses = typeof response.responses === 'string' ? JSON.parse(response.responses) : (response.responses || {});

  const stats = {
    total: exam.questions.length,
    correct: 0,
    incorrect: 0,
    unattempted: 0,
    points: 0,
    totalPoints: exam.questions.reduce((acc, q) => acc + (q.points || 1), 0)
  };

  exam.questions.forEach(q => {
    const answer = studentResponses[q.id];
    if (!answer) {
      stats.unattempted++;
    } else if (String(answer).trim().toLowerCase() === String(q.correct_answer).trim().toLowerCase()) {
      stats.correct++;
      stats.points += (q.points || 1);
    } else {
      stats.incorrect++;
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-900"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Submission Analysis</h1>
          <p className="text-slate-500 font-medium text-sm">Detailed performance review for {response.name}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl shadow-slate-900/20">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Final Score</p>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-black tracking-tighter leading-none">{response.score}</span>
            <span className="text-slate-500 font-bold mb-1">/ {stats.totalPoints}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Correct</p>
            <p className="text-2xl font-black text-slate-900">{stats.correct}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Incorrect</p>
            <p className="text-2xl font-black text-slate-900">{stats.incorrect}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Skipped</p>
            <p className="text-2xl font-black text-slate-900">{stats.unattempted}</p>
          </div>
        </div>
      </div>

      {/* Meta Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Candidate Info */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-fit">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            Candidate Info
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-50">
              <span className="text-xs font-bold text-slate-400">Name</span>
              <span className="text-sm font-black text-slate-900">{response.name}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-50">
              <span className="text-xs font-bold text-slate-400">ID / Email</span>
              <span className="text-sm font-black text-slate-900 truncate max-w-[150px]">{response.student_id}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-50">
              <span className="text-xs font-bold text-slate-400">Exam Title</span>
              <span className="text-sm font-black text-slate-900">{exam.title}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-xs font-bold text-slate-400">Submitted At</span>
              <span className="text-sm font-black text-slate-900">
                {new Date(response.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Responses Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Response Breakdown
          </h3>
          
          <div className="space-y-4">
            {exam.questions.map((q, idx) => {
              const studentAnswer = studentResponses[q.id];
              const isCorrect = String(studentAnswer || '').trim().toLowerCase() === String(q.correct_answer || '').trim().toLowerCase();
              
              return (
                <div 
                  key={q.id}
                  className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm group hover:border-blue-200 transition-all"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 font-black text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <div className="space-y-3">
                        <p className="text-sm font-bold text-slate-900 leading-relaxed">{q.text}</p>
                        
                        <div className="flex flex-wrap gap-4">
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Student Answer</p>
                            <div className={`text-xs font-black px-3 py-1.5 rounded-lg border ${
                              !studentAnswer ? 'bg-slate-50 text-slate-400 border-slate-100' :
                              isCorrect ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                            }`}>
                              {studentAnswer || 'SKIPPED'}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Correct Answer</p>
                            <div className="text-xs font-black px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                              {q.correct_answer}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Weightage</p>
                            <div className="text-xs font-black px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg border border-slate-100">
                              {q.points || 1} Points
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={`p-2 rounded-full ${
                      !studentAnswer ? 'text-slate-200' :
                      isCorrect ? 'text-emerald-500 bg-emerald-50' : 'text-red-500 bg-red-50'
                    }`}>
                      {!studentAnswer ? <HelpCircle className="w-5 h-5" /> :
                       isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionAnalytics;
