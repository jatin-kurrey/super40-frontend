import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Drone, Car, Code2, Users, Calendar, Clock, Download,
  ChevronDown, Info, Search, CheckCircle, XCircle, Clock3,
  ArrowUpRight, Eye, Layers
} from 'lucide-react';
import { applicationService, settingsService } from '../api';

const PROGRAMS = [
  {
    slug: 'drone',
    title: 'Drone Technology',
    formType: 'PROGRAM_DRONE',
    icon: Drone,
    color: '#00BA59',
    lightBg: 'bg-green-50',
    lightText: 'text-green-700',
    startKey: 'drone_enrollment_start',
    endKey: 'drone_enrollment_end',
  },
  {
    slug: 'ev',
    title: 'EV Manufacturing & Embedded Systems',
    formType: 'PROGRAM_EV',
    icon: Car,
    color: '#1D78FD',
    lightBg: 'bg-blue-50',
    lightText: 'text-blue-700',
    startKey: 'ev_enrollment_start',
    endKey: 'ev_enrollment_end',
  },
  {
    slug: 'coding',
    title: 'Advanced Coding Program',
    formType: 'PROGRAM_CODING',
    icon: Code2,
    color: '#FF6463',
    lightBg: 'bg-red-50',
    lightText: 'text-red-700',
    startKey: 'coding_enrollment_start',
    endKey: 'coding_enrollment_end',
  },
];

const StatusBadge = ({ status }) => {
  const styles = {
    APPROVED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    REJECTED: 'bg-red-50 text-red-600 border-red-100',
    PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
  };
  const icons = {
    APPROVED: CheckCircle,
    REJECTED: XCircle,
    PENDING: Clock3,
  };
  const s = (status || 'PENDING').toUpperCase();
  const Icon = icons[s] || Clock3;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${styles[s] || styles.PENDING}`}>
      <Icon className="w-3 h-3" />
      {s}
    </span>
  );
};

const ProgramManager = () => {
  const queryClient = useQueryClient();
  const [activeProgram, setActiveProgram] = useState('drone');
  const [search, setSearch] = useState('');
  const [dateForm, setDateForm] = useState({
    drone_enrollment_start: '',
    drone_enrollment_end: '',
    ev_enrollment_start: '',
    ev_enrollment_end: '',
    coding_enrollment_start: '',
    coding_enrollment_end: '',
  });
  const [savingKey, setSavingKey] = useState(null);

  const currentProgram = PROGRAMS.find((p) => p.slug === activeProgram);

  // Fetch all settings
  const { data: settingsData } = useQuery({
    queryKey: ['program-settings'],
    queryFn: async () => {
      const res = await settingsService.get();
      const s = res.data || {};
      setDateForm({
        drone_enrollment_start: s.drone_enrollment_start || '',
        drone_enrollment_end: s.drone_enrollment_end || '',
        ev_enrollment_start: s.ev_enrollment_start || '',
        ev_enrollment_end: s.ev_enrollment_end || '',
        coding_enrollment_start: s.coding_enrollment_start || '',
        coding_enrollment_end: s.coding_enrollment_end || '',
      });
      return s;
    },
  });

  // Fetch all applications
  const { data: applicationsData, isLoading: appsLoading } = useQuery({
    queryKey: ['program-applications'],
    queryFn: async () => {
      const res = await applicationService.getAll();
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    },
  });

  const updateSettingMutation = useMutation({
    mutationFn: ({ key, value }) => settingsService.update(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-settings'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => applicationService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-applications'] });
    },
  });

  const handleSaveDates = async (startKey, endKey) => {
    setSavingKey(startKey);
    try {
      await Promise.all([
        updateSettingMutation.mutateAsync({ key: startKey, value: dateForm[startKey] }),
        updateSettingMutation.mutateAsync({ key: endKey, value: dateForm[endKey] }),
      ]);
      alert('Enrollment dates saved!');
    } catch (err) {
      alert('Failed to save. Please try again.');
    } finally {
      setSavingKey(null);
    }
  };

  // Filter enrollments for current program
  const programApps = (applicationsData || []).filter((app) => {
    const matchType = app.form_type === currentProgram?.formType;
    const matchSearch = !search ||
      app.name?.toLowerCase().includes(search.toLowerCase()) ||
      app.email?.toLowerCase().includes(search.toLowerCase()) ||
      app.phone?.includes(search);
    return matchType && matchSearch;
  });

  // Stats per program
  const statsByProgram = PROGRAMS.map((p) => {
    const apps = (applicationsData || []).filter((a) => a.form_type === p.formType);
    return {
      ...p,
      total: apps.length,
      pending: apps.filter((a) => (a.status || 'PENDING').toUpperCase() === 'PENDING').length,
      approved: apps.filter((a) => a.status?.toUpperCase() === 'APPROVED').length,
    };
  });

  const getEnrollmentStatus = (prog) => {
    const now = new Date();
    const start = settingsData?.[prog.startKey];
    const end = settingsData?.[prog.endKey];
    if (!start && !end) return { label: 'Always Open', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (start && now < new Date(start)) return { label: 'Upcoming', color: 'text-amber-600', bg: 'bg-amber-50' };
    if (end) {
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
      if (now > endDate) return { label: 'Closed', color: 'text-red-600', bg: 'bg-red-50' };
    }
    return { label: 'Open', color: 'text-emerald-600', bg: 'bg-emerald-50' };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
            ISAB Programs
          </h1>
          <p className="text-slate-500 font-medium">
            Manage enrollment windows and review student registrations for all tech programs.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-100 px-5 py-3 rounded-2xl shadow-sm">
          <Layers className="w-4 h-4 text-slate-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {(applicationsData || []).filter((a) => PROGRAMS.some((p) => p.formType === a.form_type)).length} Total Enrollments
          </span>
        </div>
      </div>

      {/* Program Cards Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsByProgram.map((prog) => {
          const status = getEnrollmentStatus(prog);
          const PIcon = prog.icon;
          return (
            <button
              key={prog.slug}
              onClick={() => setActiveProgram(prog.slug)}
              className={`bg-white border-2 rounded-[2rem] p-8 text-left transition-all duration-300 hover:shadow-lg group ${
                activeProgram === prog.slug
                  ? 'shadow-xl scale-[1.02]'
                  : 'border-slate-100 hover:border-slate-200'
              }`}
              style={activeProgram === prog.slug ? { borderColor: prog.color, boxShadow: `0 8px 32px ${prog.color}20` } : {}}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: `${prog.color}15` }}
                >
                  <PIcon className="w-7 h-7" style={{ color: prog.color }} />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${status.bg} ${status.color}`}>
                  {status.label}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tighter mb-1 leading-tight">{prog.title}</h3>
              <div className="flex items-center gap-4 mt-4">
                <div>
                  <div className="text-2xl font-black text-slate-900">{prog.total}</div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-amber-600">{prog.pending}</div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pending</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-600">{prog.approved}</div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Approved</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {currentProgram && (
        <>
          {/* Enrollment Window Settings */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${currentProgram.color}15` }}
              >
                <Calendar className="w-5 h-5" style={{ color: currentProgram.color }} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tighter">
                  {currentProgram.title} — Enrollment Window
                </h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Set the dates students can register
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Enrollment Opens On
                </label>
                <input
                  type="date"
                  value={dateForm[currentProgram.startKey]}
                  onChange={(e) => setDateForm((prev) => ({ ...prev, [currentProgram.startKey]: e.target.value }))}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-900"
                />
                <p className="text-[10px] text-slate-400 mt-2 font-medium">
                  Leave blank to always allow registration.
                </p>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Enrollment Closes On
                </label>
                <input
                  type="date"
                  value={dateForm[currentProgram.endKey]}
                  onChange={(e) => setDateForm((prev) => ({ ...prev, [currentProgram.endKey]: e.target.value }))}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-900"
                />
                <p className="text-[10px] text-slate-400 mt-2 font-medium">
                  Leave blank for no end date.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleSaveDates(currentProgram.startKey, currentProgram.endKey)}
              disabled={savingKey === currentProgram.startKey}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:transform-none"
              style={{ backgroundColor: currentProgram.color }}
            >
              {savingKey === currentProgram.startKey ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  Save Enrollment Window
                </>
              )}
            </button>
          </div>

          {/* Enrollments Table */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">
                  {currentProgram.title} — Enrollments
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {programApps.length} registration{programApps.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="text"
                    placeholder="Search by name, email, phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-11 pr-5 py-3 bg-slate-50 rounded-2xl text-sm font-medium outline-none border border-slate-100 focus:border-slate-200 transition-all w-72"
                  />
                </div>
                <button
                  onClick={() => alert('Exporting enrollment data...')}
                  className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] bg-slate-50/50 border-b border-slate-50">
                    <th className="px-8 py-6">#</th>
                    <th className="px-8 py-6">Student</th>
                    <th className="px-8 py-6">Department</th>
                    <th className="px-8 py-6">College</th>
                    <th className="px-8 py-6 text-center">Semester</th>
                    <th className="px-8 py-6 text-center">Status</th>
                    <th className="px-8 py-6 text-center">Actions</th>
                    <th className="px-8 py-6 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {appsLoading && (
                    <tr>
                      <td colSpan="8" className="p-16 text-center">
                        <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto" />
                      </td>
                    </tr>
                  )}
                  {!appsLoading && programApps.map((app, index) => {
                    const extra = typeof app.data === 'string'
                      ? (() => { try { return JSON.parse(app.data); } catch { return {}; } })()
                      : (app.data || {});
                    return (
                      <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <span className="text-sm font-black text-slate-300">#{index + 1}</span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform"
                              style={{ backgroundColor: `${currentProgram.color}15`, color: currentProgram.color }}
                            >
                              {app.name?.[0] || '?'}
                            </div>
                            <div>
                              <p className="text-[15px] font-black text-slate-900">{app.name}</p>
                              <p className="text-xs text-slate-400 font-medium">{app.email}</p>
                              <p className="text-xs text-slate-400 font-medium">{app.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-sm font-bold text-slate-600">{extra.department || '—'}</span>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-sm font-medium text-slate-500">{extra.college || '—'}</span>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className="text-sm font-black text-slate-700">{extra.semester ? `Sem ${extra.semester}` : '—'}</span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex justify-center">
                            <StatusBadge status={app.status} />
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center justify-center gap-2">
                            <select
                              value={(app.status || 'PENDING').toUpperCase()}
                              onChange={(e) => updateStatusMutation.mutate({ id: app.id, status: e.target.value })}
                              className="text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 outline-none cursor-pointer"
                            >
                              <option value="PENDING">Pending</option>
                              <option value="APPROVED">Approve</option>
                              <option value="REJECTED">Reject</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                            {new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {!appsLoading && programApps.length === 0 && (
                    <tr>
                      <td colSpan="8" className="p-24 text-center">
                        <Info className="w-10 h-10 mx-auto mb-4 text-slate-200" />
                        <p className="text-slate-300 font-bold text-sm">No enrollments found for this program yet.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProgramManager;
