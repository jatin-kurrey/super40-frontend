import React, { useState } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  LockKeyhole
} from 'lucide-react';
import { authService } from '../api';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  // Password visibility states
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Field validation
    if (!form.currentPassword) {
      setError('Current password is required');
      return;
    }

    if (form.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    if (form.newPassword !== form.confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await authService.changeSelfPassword(
        form.currentPassword,
        form.newPassword
      );
      
      setSuccess('Security profile updated! Your administrative password has been changed successfully.');
      setForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
    } catch (err) {
      setError(
        err.response?.data?.error || 
        'Failed to change password. Please verify that your current password is correct.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 flex items-center gap-3">
          <KeyRound className="w-9 h-9 text-blue-900" />
          Settings & Security
        </h1>
        <p className="text-slate-500 font-medium ml-1">
          Manage administrative credentials and update password policies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Settings Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-blue-950 to-slate-900 p-8 rounded-[2rem] text-white shadow-xl shadow-blue-950/10 flex flex-col justify-between min-h-[320px] relative overflow-hidden group">
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
              <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-400 rounded-full blur-[80px]"></div>
              <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-indigo-400 rounded-full blur-[80px]"></div>
            </div>
            
            <div className="relative z-10 space-y-6">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight mb-2">Administrative Security</h3>
                <p className="text-blue-200/80 text-sm leading-relaxed font-medium">
                  Ensure your Super Admin credentials remain highly secure. Use unique phrase-based passwords that are difficult to guess.
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-6 border-t border-white/10 flex items-center gap-3 text-xs text-blue-400 font-bold uppercase tracking-wider">
              <LockKeyhole className="w-4 h-4" />
              <span>Full System Encryption</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Password Requirements</h4>
            <ul className="space-y-3">
              {[
                'Must be at least 6 characters in length',
                'Should be different from previously used systems',
                'Avoid containing your username'
              ].map((req, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-xs text-slate-500 font-semibold">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-900"></div>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Change Password Form Card */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8 md:p-10">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Change Password</h3>
            <p className="text-sm text-slate-400 font-medium">Update your profile security parameters.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-semibold flex items-start gap-3 animate-in fade-in duration-300">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm font-semibold flex items-start gap-3 animate-in fade-in duration-300">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
            {/* Current Password */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Current Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-900 transition-colors" />
                </div>
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  name="currentPassword"
                  value={form.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Enter current password"
                  className="block w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 focus:bg-white transition-all font-semibold text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                New Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-900 transition-colors" />
                </div>
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleInputChange}
                  placeholder="At least 6 characters"
                  className="block w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 focus:bg-white transition-all font-semibold text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Confirm New Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-900 transition-colors" />
                </div>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  name="confirmNewPassword"
                  value={form.confirmNewPassword}
                  onChange={handleInputChange}
                  placeholder="Verify new password"
                  className="block w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 focus:bg-white transition-all font-semibold text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-blue-900 hover:bg-blue-800 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 active:scale-95 transition-all duration-300 flex items-center gap-2.5 disabled:opacity-75"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating Password...
                </>
              ) : (
                'Save Security Changes'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
