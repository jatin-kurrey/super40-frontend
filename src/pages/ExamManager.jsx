import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  FileText, 
  Clock, 
  Save,
  Trophy,
  Download,
  Info,
  ArrowRight,
  GraduationCap,
  Users,
  TrendingUp,
  Image,
  Upload,
  Loader2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { examService, uploadService, settingsService } from '../api';

const ExamManager = () => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState('list'); // list, create, edit, results
  const [selectedExam, setSelectedExam] = useState(null);
  const [responses, setResponses] = useState([]);
  const [uploadingStates, setUploadingStates] = useState({}); // { qIndex: boolean }

  const { data: exams = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      const res = await examService.getAllAdmin();
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    }
  });

  const { data: settings = {} } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await settingsService.get();
      return res.data || {};
    }
  });

  const updateSettingMutation = useMutation({
    mutationFn: ({ key, value }) => settingsService.update(key, value),
    onMutate: async (newSetting) => {
      await queryClient.cancelQueries({ queryKey: ['settings'] });
      const previousSettings = queryClient.getQueryData(['settings']);
      queryClient.setQueryData(['settings'], (old) => ({
        ...old,
        [newSetting.key]: newSetting.value
      }));
      return { previousSettings };
    },
    onError: (err, newSetting, context) => {
      queryClient.setQueryData(['settings'], context?.previousSettings);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => examService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['exams']);
      setViewMode('list');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => examService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['exams']);
      setViewMode('list');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => examService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['exams']);
    }
  });

  const responsesMutation = useMutation({
    mutationFn: (id) => examService.getResponses(id),
    onSuccess: (res) => {
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setResponses(data);
      setViewMode('results');
    }
  });

  const activateMutation = useMutation({
    mutationFn: (id) => examService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['exams']);
      queryClient.invalidateQueries(['active-exams']);
    }
  });

  const handleFileUpload = async (qIndex, file) => {
    if (!file) return;
    
    setUploadingStates(prev => ({ ...prev, [qIndex]: true }));
    try {
      const res = await uploadService.upload(file);
      const fileURL = res.data.url;
      handleQuestionChange(qIndex, 'image_url', fileURL);
    } catch (err) {
      console.error("Upload Error:", err);
      alert("Failed to upload image");
    } finally {
      setUploadingStates(prev => ({ ...prev, [qIndex]: false }));
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    negative_marking: 0,
    shuffle_questions: false,
    browser_lockdown: false,
    show_result_immediately: false,
    start_time: '',
    end_time: '',
    is_active: false,
    questions: []
  });

  const handleAddQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          text: '',
          type: 'MCQ',
          options: ['', '', '', ''],
          correct_answer: '',
          points: 1,
          image_url: '',
          subject: '',
          difficulty: 'Medium'
        }
      ]
    }));
  };

  const handleRemoveQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index][field] = value;
    setFormData(prev => ({ ...prev, questions: newQuestions }));
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setFormData(prev => ({ ...prev, questions: newQuestions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (viewMode === 'create') {
      createMutation.mutate(formData);
    } else {
      updateMutation.mutate({ id: selectedExam.id, data: formData });
    }
  };

  const handleEdit = (exam) => {
    setSelectedExam(exam);
    setFormData({
      ...exam,
      start_time: exam.start_time ? exam.start_time.split('T')[0] : '',
      end_time: exam.end_time ? exam.end_time.split('T')[0] : ''
    });
    setViewMode('edit');
  };

  const handleViewResults = (exam) => {
    setSelectedExam(exam);
    responsesMutation.mutate(exam.id);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      deleteMutation.mutate(id);
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading Exams...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
            {viewMode === 'list' ? 'Super 40 Exams' : 
             viewMode === 'create' ? 'Create New Exam' : 
             viewMode === 'edit' ? 'Edit Exam' : 'Institutional Report'}
          </h1>
          <p className="text-slate-500 font-medium">
            {viewMode === 'list' ? 'Manage entrance examinations, monitor performance, and export results.' : 
             'Design professional-grade institutional assessments with precision.'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {viewMode === 'list' ? (
            <>
              {/* Direct Exam Mode Toggle Switch */}
              <div className="flex items-center gap-3 bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Direct Exam Mode</span>
                <button
                  type="button"
                  onClick={() => {
                    const newValue = settings.direct_exam_mode === 'true' ? 'false' : 'true';
                    updateSettingMutation.mutate({ key: 'direct_exam_mode', value: newValue });
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none cursor-pointer duration-300 ${
                    settings.direct_exam_mode === 'true' ? 'bg-blue-900' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.direct_exam_mode === 'true' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <button 
                onClick={() => refetch()}
                disabled={loading}
                className="p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all border border-slate-200 bg-white"
                title="Refresh Exams"
              >
                <div className="flex items-center gap-2 px-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Refresh</span>
                </div>
              </button>
              <button 
                onClick={() => {
                  setFormData({
                    title: '',
                    description: '',
                    duration: 30,
                    negative_marking: 0,
                    shuffle_questions: false,
                    browser_lockdown: false,
                    show_result_immediately: false,
                    start_time: '',
                    end_time: '',
                    is_active: false,
                    questions: []
                  });
                  setViewMode('create');
                }}
                className="flex items-center gap-3 bg-blue-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-xl shadow-blue-900/20"
              >
                <Plus className="w-5 h-5" />
                Create Exam
              </button>
            </>
          ) : (
            <button 
              onClick={() => setViewMode('list')}
              className="text-slate-500 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Return to Dashboard
            </button>
          )}
        </div>
      </div>

      {viewMode === 'list' && (
        <>
          {/* Assessment Cycle Settings */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-sm space-y-8 animate-in fade-in">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter mb-1 uppercase tracking-wide">
                Assessment Cycle Settings
              </h2>
              <p className="text-slate-500 font-semibold text-sm">
                Enforce strict registration durations, exam time slots, and results declaration gates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* Registration Start */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Registration Start</label>
                <input 
                  type="date" 
                  value={settings.registration_start_date || ""}
                  onChange={e => updateSettingMutation.mutate({ key: 'registration_start_date', value: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 focus:bg-white transition-all font-semibold text-slate-800 text-sm"
                />
              </div>

              {/* Registration Last Date */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Registration Deadline</label>
                <input 
                  type="date" 
                  value={settings.registration_last_date || ""}
                  onChange={e => updateSettingMutation.mutate({ key: 'registration_last_date', value: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 focus:bg-white transition-all font-semibold text-slate-800 text-sm"
                />
              </div>

              {/* Exam Date */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Examination Date</label>
                <input 
                  type="date" 
                  value={settings.exam_date || ""}
                  onChange={e => updateSettingMutation.mutate({ key: 'exam_date', value: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 focus:bg-white transition-all font-semibold text-slate-800 text-sm"
                />
              </div>

              {/* Specific Exam Hours (Start & End) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Exam Time Window</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="time" 
                    value={settings.exam_start_time || ""}
                    onChange={e => updateSettingMutation.mutate({ key: 'exam_start_time', value: e.target.value })}
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 focus:bg-white transition-all font-semibold text-slate-800 text-xs"
                  />
                  <span className="text-slate-400 font-bold text-xs">to</span>
                  <input 
                    type="time" 
                    value={settings.exam_end_time || ""}
                    onChange={e => updateSettingMutation.mutate({ key: 'exam_end_time', value: e.target.value })}
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 focus:bg-white transition-all font-semibold text-slate-800 text-xs"
                  />
                </div>
              </div>

              {/* Results Gate Date */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Results Release Date</label>
                <input 
                  type="date" 
                  value={settings.results_date || ""}
                  onChange={e => updateSettingMutation.mutate({ key: 'results_date', value: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 focus:bg-white transition-all font-semibold text-slate-800 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {exams.map(exam => (
            <div key={exam.id} className="group bg-white border border-slate-200 rounded-[2.5rem] p-10 hover:border-blue-200 transition-all duration-500 flex flex-col relative">
              {/* Status Indicator / Interactive Toggle Switch */}
              <button 
                type="button"
                onClick={() => {
                  if (!exam.is_active) {
                    if (window.confirm(`Set "${exam.title}" as the active Super 40 Entrance Exam? (All other exams will be set as archived)`)) {
                      activateMutation.mutate(exam.id);
                    }
                  }
                }}
                disabled={exam.is_active || activateMutation.isPending}
                className={`absolute top-8 right-8 flex items-center gap-2.5 px-4 py-2 rounded-full transition-all border shadow-sm ${
                  exam.is_active 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-emerald-500/5' 
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-100 cursor-pointer'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${exam.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
                <span className="text-[9px] font-black uppercase tracking-[0.15em]">
                  {exam.is_active ? 'Active Exam' : 'Set Active'}
                </span>
              </button>

              <div className="mb-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-500">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Institutional Assessment</div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{exam.title}</h3>
                  </div>
                </div>

                <p className="text-slate-500 text-[13px] leading-relaxed mb-8 line-clamp-2 font-medium">{exam.description}</p>
                
                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                  <div>
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Clock className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Time Limit</span>
                    </div>
                    <p className="text-sm font-black text-slate-700 uppercase tracking-tighter">{exam.duration} Minutes</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <FileText className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Coverage</span>
                    </div>
                    <p className="text-sm font-black text-slate-700 uppercase tracking-tighter">{exam.questions?.length || 0} Questions</p>
                  </div>
                </div>
              </div>

              {/* Minimal Stats */}
              <div className="mt-auto">
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100/50 mb-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[18px] font-black text-slate-900 tracking-tighter tabular-nums leading-none">{exam.appearances || 0}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em]">Total Candidates</p>
                    </div>
                    <div className="space-y-1 border-l border-slate-200 pl-4">
                      <p className="text-[18px] font-black text-slate-900 tracking-tighter tabular-nums leading-none">{(exam.avg_score || 0).toFixed(1)}%</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em]">Mean Performance</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleViewResults(exam)}
                    className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-900 transition-all flex items-center justify-center gap-2"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    Detailed Report
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(exam)} className="p-4 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-2xl transition-all">
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(exam.id)} className="p-4 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-2xl transition-all">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {exams.length === 0 && (
            <div className="col-span-full py-40 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Info className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tighter">No Examinations Found</h3>
              <p className="text-slate-400 font-medium">Connect with the system by creating your first institutional assessment.</p>
            </div>
          )}
        </div>
        </>
      )}

      {(viewMode === 'create' || viewMode === 'edit') && (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
          <div className="bg-white border border-slate-100 rounded-[3rem] p-12 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/30 rounded-full blur-3xl -mr-32 -mt-32"></div>

            <h3 className="text-xl font-black text-slate-900 mb-10 border-b border-slate-50 pb-6 tracking-tighter uppercase tracking-[0.1em]">
              Examination Blueprints
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Exam Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-200 focus:bg-white transition-all font-bold text-slate-900"
                  placeholder="e.g. Super 40 Entrance Test 2026"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Duration (Minutes)</label>
                <input 
                  type="number" 
                  value={formData.duration}
                  onChange={e => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-200 focus:bg-white transition-all font-bold"
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Instructions & Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-200 focus:bg-white transition-all h-40 font-medium leading-relaxed"
                  placeholder="Provide comprehensive instructions for the candidates..."
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Start Window</label>
                <input 
                  type="date" 
                  value={formData.start_time}
                  onChange={e => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-200 focus:bg-white transition-all font-bold"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">End Window</label>
                <input 
                  type="date" 
                  value={formData.end_time}
                  onChange={e => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-200 focus:bg-white transition-all font-bold"
                />
              </div>
              <div className="flex items-center gap-4 bg-slate-900 p-6 rounded-[1.5rem] text-white shadow-xl shadow-slate-900/10">
                <input 
                  type="checkbox" 
                  id="is_active"
                  checked={formData.is_active}
                  onChange={e => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-6 h-6 rounded-lg text-blue-600 border-white/20 focus:ring-blue-500 bg-white/10"
                />
                <label htmlFor="is_active" className="text-xs font-black uppercase tracking-[0.2em] cursor-pointer">Live Deployment Mode</label>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[3rem] p-12 shadow-[0_8px_40px_rgb(0,0,0,0.02)]">
            <h3 className="text-xl font-black text-slate-900 mb-10 border-b border-slate-50 pb-6 tracking-tighter uppercase tracking-[0.1em]">
              Enterprise Integrity Protocols
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              <div className="space-y-4">
                <div className="flex items-center gap-2 group relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Negative Marking</label>
                  <Info className="w-3.5 h-3.5 text-slate-300 cursor-help" />
                  <div className="absolute bottom-full left-0 mb-2 w-48 p-3 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl font-medium leading-relaxed">
                    Deducts points for incorrect answers to prevent random guessing. Use 0.25 for standard marking.
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-[1.2rem] border border-slate-100">
                  <input 
                    type="number" 
                    step="0.25"
                    value={formData.negative_marking}
                    onChange={e => setFormData(prev => ({ ...prev, negative_marking: parseFloat(e.target.value) }))}
                    className="w-full bg-transparent focus:outline-none font-black text-red-600 text-lg"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Integrity Suite</label>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.2rem] border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors group relative">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Shuffle</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-1">Randomizes question order per student</span>
                    </div>
                    <input type="checkbox" checked={formData.shuffle_questions} onChange={e => setFormData(prev => ({ ...prev, shuffle_questions: e.target.checked }))} className="w-6 h-6 rounded-md text-blue-900 border-slate-200" />
                  </label>
                  
                  <label className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.2rem] border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors group">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Lockdown</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-1">Prevents tab switching & screenshots</span>
                    </div>
                    <input type="checkbox" checked={formData.browser_lockdown} onChange={e => setFormData(prev => ({ ...prev, browser_lockdown: e.target.checked }))} className="w-6 h-6 rounded-md text-blue-900 border-slate-200" />
                  </label>

                  <label className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.2rem] border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors group">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Instant Result</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-1">Shows score immediately after submission</span>
                    </div>
                    <input type="checkbox" checked={formData.show_result_immediately} onChange={e => setFormData(prev => ({ ...prev, show_result_immediately: e.target.checked }))} className="w-6 h-6 rounded-md text-blue-900 border-slate-200" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between px-6">
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Question Paper Architect</h3>
              <button 
                type="button" 
                onClick={handleAddQuestion}
                className="bg-blue-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 hover:bg-slate-900 transition-all flex items-center gap-3"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
            </div>

            <div className="space-y-10">
              {formData.questions.map((q, qIndex) => (
                <div key={qIndex} className="bg-white border border-slate-100 rounded-[3rem] p-12 shadow-sm relative group animate-in slide-in-from-bottom-8 duration-500">
                  <button 
                    type="button"
                    onClick={() => handleRemoveQuestion(qIndex)}
                    className="absolute top-8 right-8 w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-300"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                      <div className="md:col-span-3 space-y-3">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-blue-900 text-white w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black">Q{qIndex + 1}</span>
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Institutional Query</label>
                        </div>
                        <div className="space-y-4">
                          <input 
                            type="text" 
                            value={q.text}
                            onChange={e => handleQuestionChange(qIndex, 'text', e.target.value)}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.2rem] focus:outline-none focus:bg-white transition-all font-bold text-slate-800"
                            placeholder="Statement of the assessment query..."
                            required
                          />
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                              <Image className="w-3.5 h-3.5 text-slate-400" />
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question Visual / Graph (Drag & Drop or Upload)</label>
                            </div>
                            
                            {!q.image_url ? (
                              <label 
                                className={`relative group/drop cursor-pointer border-2 border-dashed border-slate-200 rounded-[1.5rem] p-10 flex flex-col items-center justify-center gap-4 transition-all hover:border-blue-300 hover:bg-blue-50/50 ${uploadingStates[qIndex] ? 'opacity-50 pointer-events-none' : ''}`}
                                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-blue-400', 'bg-blue-50'); }}
                                onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50'); }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                                  const file = e.dataTransfer.files[0];
                                  handleFileUpload(qIndex, file);
                                }}
                              >
                                {uploadingStates[qIndex] ? (
                                  <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Uploading Visual...</p>
                                  </div>
                                ) : (
                                  <>
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover/drop:text-blue-600 group-hover/drop:scale-110 transition-all shadow-sm">
                                      <Upload className="w-6 h-6" />
                                    </div>
                                    <div className="text-center">
                                      <p className="text-xs font-black text-slate-600 uppercase tracking-widest mb-1">Drop Image Here</p>
                                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Support PNG, JPG, WEBP (Max 5MB)</p>
                                    </div>
                                    <input 
                                      type="file" 
                                      className="hidden" 
                                      accept="image/*"
                                      onChange={(e) => handleFileUpload(qIndex, e.target.files[0])}
                                    />
                                  </>
                                )}
                              </label>
                            ) : (
                              <div className="relative group/preview rounded-[1.5rem] overflow-hidden border border-slate-200 bg-white p-4 shadow-sm animate-in zoom-in-95 duration-300">
                                <img 
                                  src={q.image_url.startsWith('http') ? q.image_url : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'}${q.image_url}`} 
                                  alt="Question Visual" 
                                  className="h-48 w-full object-contain rounded-xl"
                                />
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                  <button 
                                    type="button"
                                    onClick={() => handleQuestionChange(qIndex, 'image_url', '')}
                                    className="bg-white text-red-500 p-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all transform translate-y-4 group-hover/preview:translate-y-0"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Remove Visual
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Response Type</label>
                        <select 
                          value={q.type}
                          onChange={e => handleQuestionChange(qIndex, 'type', e.target.value)}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.2rem] focus:outline-none font-bold"
                        >
                          <option value="MCQ">Multiple Choice</option>
                          <option value="INTEGER">Integer Value</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Subject Section</label>
                        <input 
                          list="subjects"
                          value={q.subject}
                          onChange={e => handleQuestionChange(qIndex, 'subject', e.target.value)}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.2rem] focus:outline-none font-bold"
                          placeholder="Physics, Maths, etc."
                        />
                        <datalist id="subjects">
                          <option value="Physics" />
                          <option value="Chemistry" />
                          <option value="Mathematics" />
                          <option value="Logical Reasoning" />
                          <option value="General Aptitude" />
                        </datalist>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Difficulty Level</label>
                        <div className="flex gap-2">
                          {['Easy', 'Medium', 'Hard'].map((lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => handleQuestionChange(qIndex, 'difficulty', lvl)}
                              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                q.difficulty === lvl 
                                  ? lvl === 'Easy' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                                    lvl === 'Medium' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' :
                                    'bg-red-500 text-white shadow-lg shadow-red-500/20'
                                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                              }`}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {q.type === 'MCQ' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100/50">
                        {q.options.map((opt, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-4 group/opt">
                            <span className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-400 shadow-sm group-focus-within/opt:bg-blue-900 group-focus-within/opt:text-white transition-all">
                              {String.fromCharCode(65 + oIndex)}
                            </span>
                            <input 
                              type="text" 
                              value={opt}
                              onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)}
                              className="flex-1 px-5 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-900 transition-all font-bold"
                              placeholder={`Option Variant ${oIndex + 1}`}
                              required
                            />
                            <input 
                              type="radio" 
                              name={`correct-${qIndex}`}
                              checked={q.correct_answer === opt && opt !== ''}
                              onChange={() => handleQuestionChange(qIndex, 'correct_answer', opt)}
                              className="w-6 h-6 text-emerald-600 focus:ring-emerald-500 border-slate-200"
                              required
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {q.type === 'INTEGER' && (
                      <div className="p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100/50">
                        <div className="flex flex-col gap-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Correct Integer Response</label>
                          <input 
                            type="number"
                            value={q.correct_answer}
                            onChange={e => handleQuestionChange(qIndex, 'correct_answer', e.target.value)}
                            className="w-full max-w-[200px] px-6 py-4 bg-white border border-slate-200 rounded-xl font-black text-blue-900"
                            placeholder="e.g. 42"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center py-10">
              <button 
                type="submit"
                className="flex items-center gap-3 bg-blue-900 text-white px-16 py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] hover:bg-slate-900 transition-all shadow-2xl shadow-blue-900/20 hover:shadow-slate-900/30 transform hover:-translate-y-2 duration-500"
              >
                <Save className="w-5 h-5" />
                {viewMode === 'create' ? 'Publish Institutional Paper' : 'Commit Configuration Changes'}
              </button>
            </div>
          </div>
        </form>
      )}

      {viewMode === 'results' && (
        <div className="space-y-10 animate-in fade-in duration-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm flex items-center gap-8 group">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center group-hover:bg-blue-900 group-hover:text-white transition-all duration-500">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Candidacy Pool</p>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{responses.length}</h3>
              </div>
            </div>
            <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm flex items-center gap-8 group">
              <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-[1.5rem] flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all duration-500">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Peak Performance</p>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">
                  {responses.length > 0 ? Math.max(...responses.map(r => r.score)) : 0}
                </h3>
              </div>
            </div>
            <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm flex items-center gap-8 group">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[1.5rem] flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Average Performance</p>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">
                  {responses.length > 0 
                    ? (responses.reduce((acc, r) => acc + r.score, 0) / responses.length).toFixed(1) 
                    : 0}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[3rem] shadow-[0_8px_40px_rgb(0,0,0,0.03)] overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase tracking-[0.05em]">{selectedExam?.title}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional Merit Leaderboard</p>
              </div>
              <button 
                onClick={() => alert("Generating Detailed Institutional Excel Report (Enterprise License Active)...")}
                className="flex items-center gap-3 bg-blue-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-xl shadow-blue-900/10"
              >
                <Download className="w-4 h-4" />
                Export Full Report
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] bg-white border-b border-slate-50">
                    <th className="px-10 py-8">Merit Rank</th>
                    <th className="px-10 py-8">Candidate Profile</th>
                    <th className="px-10 py-8 text-center">Score Delta</th>
                    <th className="px-10 py-8 text-center">Protocol Status</th>
                    <th className="px-10 py-8 text-right">Assessment Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {responses.map((res, index) => (
                    <tr key={res.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-6">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                          index === 0 ? 'bg-amber-100 text-amber-700 shadow-lg shadow-amber-500/10' : 
                          index === 1 ? 'bg-slate-100 text-slate-500' :
                          index === 2 ? 'bg-orange-100 text-orange-700' : 'text-slate-300'
                        }`}>
                          #{index + 1}
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center font-black text-blue-900 group-hover:scale-110 transition-transform duration-500">
                            {res.name ? res.name[0] : '?'}
                          </div>
                          <div>
                            <p className="text-[16px] font-black text-slate-900 tracking-tighter">{res.name}</p>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{res.student_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <span className="text-2xl font-black text-blue-900 tracking-tighter">{res.score}</span>
                        <span className="text-[10px] font-bold text-slate-300 ml-1">pts</span>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <span className="text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                          Verified Submission
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(res.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                  {responses.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-32 text-center text-slate-300">
                        <Info className="w-12 h-12 mx-auto mb-6 opacity-20" />
                        <p className="text-lg font-bold tracking-tight">No assessment data currently available.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamManager;
