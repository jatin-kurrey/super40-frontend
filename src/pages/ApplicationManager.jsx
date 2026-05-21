import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  Mail, 
  Phone, 
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trophy,
  GraduationCap,
  ChevronRight
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationService } from '../api';

import SubmissionAnalytics from './SubmissionAnalytics';

const ApplicationManager = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedResponseId, setSelectedResponseId] = useState(null);

  const { data: applications = [], isLoading: loading } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const res = await applicationService.getAll();
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => applicationService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['applications']);
    }
  });

  const handleStatusUpdate = (id, status) => {
    statusMutation.mutate({ id, status });
  };

  const filteredApps = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status?.toLowerCase() === filter.toLowerCase();
    const matchesSearch = (app.name || '').toLowerCase().includes(search.toLowerCase()) || 
                          (app.email || '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'approved' || s === 'accepted') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (s === 'rejected') return 'bg-red-50 text-red-600 border-red-100';
    return 'bg-amber-50 text-amber-600 border-amber-100';
  };

  if (selectedResponseId) {
    return <SubmissionAnalytics responseId={selectedResponseId} onBack={() => setSelectedResponseId(null)} />;
  }

  if (loading) return (
    <div className="p-20 text-center animate-pulse">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl mx-auto mb-6"></div>
      <div className="h-4 w-32 bg-slate-100 mx-auto rounded-full"></div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Applications
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Review and manage student admissions and exam registrations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 active:scale-95">
            <Mail className="w-4 h-4" />
            Bulk Email
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl text-sm focus:outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-slate-700"
            />
          </div>
          <div className="flex p-1 bg-slate-100 rounded-xl w-full md:w-auto">
            {['all', 'pending', 'approved', 'rejected'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${
                  filter === f 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-y border-slate-100">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Candidate</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Info</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Applied For</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Merit / Score</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map((app) => (
                <tr key={app.id} className="group hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-xl shadow-slate-900/10 ring-4 ring-slate-50">
                        {app.name ? app.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 tracking-tight">{app.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {app.id?.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="text-xs font-bold">{app.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-bold">{app.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg w-fit border border-blue-100">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{app.form_type?.replace('_', ' ') || 'Super 40'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 ml-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">
                          {new Date(app.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    {app.score !== null && app.score !== undefined ? (
                      <button 
                        onClick={() => setSelectedResponseId(app.response_id)}
                        className="inline-flex flex-col items-center group/score"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl font-black text-slate-900 leading-none group-hover/score:text-blue-600 transition-colors">{app.score}</span>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover/score:text-blue-600 group-hover/score:translate-x-0.5 transition-all" />
                        </div>
                        <div className="mt-1.5 px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-tighter">
                          Rank #{[...new Set(applications.map(a => a.score || 0))].sort((a,b) => b-a).indexOf(app.score) + 1}
                        </div>
                      </button>
                    ) : (
                      <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest italic">Not Attempted</span>
                    )}
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${getStatusBadge(app.status)}`}>
                      <div className={`w-2 h-2 rounded-full animate-pulse ${
                        app.status?.toLowerCase() === 'approved' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                        app.status?.toLowerCase() === 'rejected' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                      }`} />
                      {app.status || 'PENDING'}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {app.score !== null && app.score !== undefined && (
                        <button 
                          onClick={() => setSelectedResponseId(app.response_id)}
                          className="flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <Trophy className="w-3.5 h-3.5" />
                          Analytics
                        </button>
                      )}
                      {(app.status || 'PENDING').toLowerCase() === 'pending' ? (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(app.id, 'approved')}
                            className="p-2.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(app.id, 'rejected')}
                            className="p-2.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleStatusUpdate(app.id, 'pending')}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          Reset Status
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredApps.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
              <Users className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-slate-900 font-black uppercase tracking-tighter text-xl">No applications found</h3>
            <p className="text-slate-400 text-sm font-medium">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-900">{filteredApps.length}</span> of <span className="text-slate-900">{applications.length}</span> results
          </p>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-not-allowed">Previous</button>
            <button className="px-6 py-2 text-[10px] font-black bg-white text-blue-600 border border-slate-200 uppercase tracking-widest hover:border-blue-300 rounded-xl transition-all shadow-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationManager;
