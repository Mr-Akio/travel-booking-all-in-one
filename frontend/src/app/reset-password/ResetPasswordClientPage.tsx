'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { EyeIcon, EyeSlashIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { toast, Toaster } from 'react-hot-toast';
import { api } from '@/lib/api';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (password !== confirm) {
      toast.error('❗ Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/users/reset-password-confirm/', { uid, token, new_password: password });
      toast.success('🎉 Password reset successful!');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      toast.error('❌ Invalid or expired link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
      <Toaster position="top-center" />
      <div className="w-full max-w-lg bg-white p-12 md:p-16 rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-200 text-center relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-orange-50 rounded-full blur-3xl opacity-50" />
        
        <div className="flex justify-center mb-10">
          <div className="bg-slate-900 text-white w-20 h-20 flex items-center justify-center rounded-[2rem] shadow-xl">
            <LockClosedIcon className="w-10 h-10" />
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Reset Password</h2>
        <p className="text-slate-500 font-medium mb-12 leading-relaxed">Set a new password to access your account again.</p>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div className="relative">
            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 ml-1">New Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 pr-14 text-slate-800 outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium shadow-sm"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[38px] p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-slate-800 outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium shadow-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 hover:shadow-orange-100 mt-4 disabled:opacity-50"
          >
            {loading ? 'Updating Password...' : 'Reset Password'}
          </button>
        </form>

        <p className="text-[10px] font-black text-slate-400 mt-12 uppercase tracking-[0.2em]">
          Remember your password?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-orange-500 hover:text-orange-600 transition-colors ml-1"
          >
            Go back to login
          </button>
        </p>
      </div>
    </div>
  );
}
