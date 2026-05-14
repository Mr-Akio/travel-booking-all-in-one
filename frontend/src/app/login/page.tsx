'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { toast, Toaster } from 'react-hot-toast';
import { API_BASE, api, setToken, setRefreshToken } from '@/lib/api';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/users/google-login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.detail || 'Google Login failed');
        return;
      }

      setToken(data.access);
      if (data.refresh) {
        setRefreshToken(data.refresh);
      }

      const me = await api.get<{ is_agency: boolean }>('/api/users/profile/');
      toast.success('Login successful via Google!', { duration: 1200 });
      router.replace(me.is_agency ? '/agency' : '/');
    } catch {
      toast.error('Connection error with Google Login.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.detail || 'Invalid credentials');
        return;
      }

      setToken(data.access);
      if (data.refresh) {
        setRefreshToken(data.refresh);
      }

      const me = await api.get<{ is_agency: boolean }>('/api/users/profile/');
      toast.success('Login successful!', { duration: 1200 });
      router.replace(me.is_agency ? '/agency' : '/');
    } catch {
      toast.error('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 md:p-10 font-sans">
      <Toaster position="top-center" />
      <div className="flex w-full max-w-5xl bg-white shadow-2xl rounded-[3rem] overflow-hidden border border-slate-200">
        {/* Left: form */}
        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col items-center bg-white">
          <div className="w-full max-w-sm">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 font-medium mb-10 text-sm md:text-base leading-relaxed">Sign in to manage your bookings and explore new trips.</p>

            <div className="mb-8 flex flex-col gap-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google Login failed')}
                useOneTap
                shape="pill"
                theme="outline"
                size="large"
                width="100%"
              />
            </div>

            <div className="relative my-8 w-full text-center flex items-center">
              <span className="flex-1 border-t border-slate-200" />
              <span className="px-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">Or login with email</span>
              <span className="flex-1 border-t border-slate-200" />
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium shadow-sm"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 pr-14 text-slate-800 outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium shadow-sm"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-orange-500 focus:ring-orange-500 transition-all cursor-pointer"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Remember me
                </label>
                
                <Link href="/forgot-password" size="sm" className="text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 hover:shadow-orange-100 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Login to Account'}
              </button>
            </form>

            <p className="text-center text-xs font-bold text-slate-500 mt-10">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-orange-500 hover:text-orange-600 transition-colors ml-1">
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Right: image with overlay */}
        <div
          className="hidden md:block w-1/2 relative bg-cover bg-center"
          style={{ backgroundImage: "url('/images/ian-dooley-hpTH5b6mo2s-unsplash.jpg')" }}
        >
           <div className="absolute inset-0 bg-slate-900/20" />
           <div className="absolute bottom-16 left-16 right-16">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl">
                 <p className="text-white text-lg font-bold leading-tight tracking-tight">
                    &quot;The journey of a thousand miles begins with a single step.&quot;
                 </p>
                 <p className="text-white/60 text-xs mt-2 font-black uppercase tracking-widest">— Lao Tzu</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
