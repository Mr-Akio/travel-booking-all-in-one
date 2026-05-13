'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post('/api/users/reset-password/', { email });
      toast.success('📩 Password reset link has been sent to your email');
    } catch (err: any) {
      toast.error(err.message || '❌ Email not found in the system');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <Toaster position="top-center" />
      <div className="w-full max-w-lg bg-white p-12 md:p-16 rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-200 text-center">
        <div className="flex justify-center mb-8">
          <div className="bg-orange-50 text-orange-500 w-20 h-20 flex items-center justify-center rounded-[2rem] text-3xl shadow-inner border border-orange-100">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Forgot Password?</h1>
        <p className="text-slate-500 font-medium mb-12">No worries, it happens. Enter your email and we&apos;ll send you instructions to reset your password.</p>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div>
            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-slate-800 outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium shadow-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 hover:shadow-orange-100 disabled:opacity-50 mt-4"
            disabled={!email}
          >
            Send Reset Instructions
          </button>
        </form>

        <button
          onClick={() => router.push('/login')}
          className="mt-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-orange-500 transition-all flex items-center justify-center gap-2 mx-auto"
        >
          <span className="text-lg">←</span> Back to login
        </button>
      </div>
    </div>
  );
}
