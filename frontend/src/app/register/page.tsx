'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast, Toaster } from 'react-hot-toast';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (form.password !== form.confirmPassword) {
      const msg = "Passwords don't match";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/users/register/', {
        username: form.username,
        email: form.email,
        password: form.password,
      });

      toast.success('🎉 Registration successful! Redirecting...', { duration: 3000 });
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      const errorMsg = err.message || 'Registration failed';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 md:p-10 font-sans">
      <Toaster position="top-center" />
      <div className="flex w-full max-w-5xl bg-white shadow-2xl rounded-[3rem] overflow-hidden border border-slate-200">
        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col items-center bg-white">
          <div className="w-full max-w-sm">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">Get Started</h2>
            <p className="text-slate-500 font-medium mb-10 text-sm md:text-base leading-relaxed">Create your account to start booking your dream trips.</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <button className="flex items-center justify-center border border-slate-200 py-3 rounded-2xl hover:bg-slate-50 transition-all">
                <FontAwesomeIcon icon={faGoogle} className="w-4 h-4 text-red-500" />
              </button>
              <button className="flex items-center justify-center border border-slate-200 py-3 rounded-2xl hover:bg-slate-50 transition-all">
                <FontAwesomeIcon icon={faFacebook} className="w-4 h-4 text-blue-600" />
              </button>
            </div>

            <div className="relative my-8 w-full text-center flex items-center">
              <span className="flex-1 border-t border-slate-200" />
              <span className="px-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">Or register with email</span>
              <span className="flex-1 border-t border-slate-200" />
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1.5 ml-1">Username</label>
                <input
                  type="text"
                  placeholder="traveler_one"
                  required
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium shadow-sm"
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium shadow-sm"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-5">
                <div className="relative">
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 pr-14 text-slate-800 outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium shadow-sm"
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
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
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1.5 ml-1">Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium shadow-sm"
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-1">❗ {error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 hover:shadow-orange-100 mt-4 disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create My Account'}
              </button>
            </form>

            <p className="text-center text-xs font-bold text-slate-500 mt-8">
              Already have an account?{' '}
              <Link href="/login" className="text-orange-500 hover:text-orange-600 transition-colors ml-1">Log in</Link>
            </p>
          </div>
        </div>

        <div
          className="hidden md:block w-1/2 relative bg-cover bg-center"
          style={{ backgroundImage: "url('/images/ian-dooley-hpTH5b6mo2s-unsplash.jpg')" }}
        >
           <div className="absolute inset-0 bg-slate-900/20" />
           <div className="absolute bottom-16 left-16 right-16">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl">
                 <p className="text-white text-lg font-bold leading-tight tracking-tight">
                    &quot;Explore. Dream. Discover.&quot;
                 </p>
                 <p className="text-white/60 text-[10px] mt-2 font-black uppercase tracking-widest">— Mark Twain</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
