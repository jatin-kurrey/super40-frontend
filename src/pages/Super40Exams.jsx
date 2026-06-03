import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Clock, 
  ArrowRight, 
  FileText, 
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { examService, settingsService } from '../api';

const Super40Exams = () => {
  const navigate = useNavigate();

  const { data: settings = {} } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await settingsService.get();
      return res.data || {};
    }
  });

  const { data: exams = [], isLoading: loading } = useQuery({
    queryKey: ['active-exams'],
    queryFn: async () => {
      const res = await examService.getActive();
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    }
  });

  const getExamSlotState = () => {
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

  React.useEffect(() => {
    const studentEmail = localStorage.getItem('super40_student_email');
    if (!studentEmail) {
      navigate('/');
      return;
    }

    if (settings.direct_exam_mode === 'true' && exams.length > 0 && slotStatus.state === 'open') {
      navigate(`/super40/exam/${exams[0].id}`);
    }
  }, [settings, exams, navigate, slotStatus.state]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-black text-[10px] text-slate-400 uppercase tracking-widest">Loading Exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 px-6">
      {/* Decorative BG */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-blue-900/5 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-blue-950 text-white px-6 py-2 rounded-full mb-8 shadow-xl shadow-blue-900/20 scale-110">
            <Zap className="w-4 h-4 text-blue-400 fill-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Super 40 Portal</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter leading-tight">
            Institutional <br /><span className="text-blue-900">Entrance Portal</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
            Welcome to the Super 40 Evaluation Suite. Please select your assigned examination from the modules below to commence your assessment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {exams.map((exam) => (
            <div 
              key={exam.id} 
              className="group bg-white border border-slate-100 rounded-[3rem] p-10 shadow-[0_8px_40px_rgb(0,0,0,0.03)] hover:shadow-[0_30px_60px_rgb(0,0,0,0.08)] transition-all duration-700 hover:-translate-y-2 relative overflow-hidden"
            >
              {/* Decorative gradient corner */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-900/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-900/10 transition-colors duration-700"></div>

              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-slate-900/20 group-hover:bg-blue-900 transition-all duration-500 transform -rotate-6 group-hover:rotate-0">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                {exam.negative_marking > 0 && (
                  <div className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1.5 rounded-full border border-red-100">
                    <Info className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Negative Marking</span>
                  </div>
                )}
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter group-hover:text-blue-900 transition-colors">{exam.title}</h3>
              <p className="text-slate-400 text-[14px] leading-relaxed mb-10 line-clamp-2 font-medium">{exam.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="flex flex-col gap-1.5 bg-slate-50/50 p-4 rounded-3xl border border-slate-100/50">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Duration</span>
                  </div>
                  <span className="text-lg font-black text-slate-900 tracking-tighter">{exam.duration} Min</span>
                </div>
                <div className="flex flex-col gap-1.5 bg-slate-50/50 p-4 rounded-3xl border border-slate-100/50">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Trophy className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Total Qs</span>
                  </div>
                  <span className="text-lg font-black text-slate-900 tracking-tighter">{exam.questions?.length || 0}</span>
                </div>
              </div>

              {slotStatus.state === "upcoming" ? (
                <div className="w-full bg-blue-50 text-blue-900 border border-blue-100 py-4 px-6 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest text-center flex flex-col items-center gap-1 shadow-sm">
                  <span>Examination Window Opens At</span>
                  <span className="text-xs text-blue-700 font-bold">
                    {new Date(slotStatus.start).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} • {settings.exam_start_time}
                  </span>
                </div>
              ) : slotStatus.state === "closed" ? (
                <div className="w-full bg-red-50 text-red-700 border border-red-100 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.15em] text-center shadow-sm">
                  Examination Closed
                </div>
              ) : (
                <button 
                  onClick={() => navigate(`/super40/exam/${exam.id}`)}
                  className="w-full bg-slate-900 group-hover:bg-blue-900 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 group-hover:shadow-blue-900/20 transition-all duration-500 flex items-center justify-center gap-3"
                >
                  Start Examination
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-500" />
                </button>
              )}

              <div className="mt-6 flex items-center justify-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Enterprise Secure</span>
              </div>
            </div>
          ))}

          {exams.length === 0 && (
            <div className="col-span-full py-40 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <Info className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tighter">No Active Exams</h3>
              <p className="text-slate-400 font-medium">Please check back later or contact administration.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Super40Exams;
