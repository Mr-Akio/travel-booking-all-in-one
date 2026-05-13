'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import AgencyShell from '@/components/agency/Shell';
import { 
  UserIcon, 
  PhoneIcon, 
  CheckBadgeIcon, 
  ExclamationTriangleIcon,
  CloudArrowUpIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface AgencyProfile {
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export default function AgencyProfilePage() {
  const [profile, setProfile] = useState<AgencyProfile>({});
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<AgencyProfile>('/api/users/profile/')
      .then(setProfile)
      .catch((e) => setMsg(e.message || 'Load failed'));
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    const fd = new FormData(e.currentTarget);
    try {
      await api.put<unknown>('/api/users/profile/update/', fd);
      setMsg('Profile updated successfully!');
    } catch (e: unknown) {
      const err = e as Error;
      setMsg(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AgencyShell>
      <div className="max-w-2xl mx-auto space-y-10">
        <div className="flex flex-col items-center md:items-start space-y-2">
          <div className="flex items-center gap-3">
             <BuildingOfficeIcon className="w-10 h-10 text-orange-500" />
             <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Agency <span className="text-orange-500">Profile</span>
             </h1>
          </div>
          <p className="text-slate-500 font-medium ml-1">Update your business information for customers to see.</p>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 p-8 md:p-12">
          {msg && (
            <div className={`mb-8 p-5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 border shadow-sm ${msg.includes('successfully') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
              {msg.includes('successfully') ? <CheckBadgeIcon className="w-5 h-5" /> : <ExclamationTriangleIcon className="w-5 h-5" />}
              {msg}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2 group">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-orange-500">
                    <UserIcon className="w-3.5 h-3.5" />
                    First Name
                  </label>
                  <input 
                    name="first_name" 
                    defaultValue={profile.first_name} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm" 
                    placeholder="E.g. John" 
                  />
               </div>
               <div className="space-y-2 group">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-orange-500">
                    <UserIcon className="w-3.5 h-3.5" />
                    Last Name
                  </label>
                  <input 
                    name="last_name" 
                    defaultValue={profile.last_name} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm" 
                    placeholder="E.g. Doe" 
                  />
               </div>
            </div>

            <div className="space-y-2 group">
               <label className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-orange-500">
                 <PhoneIcon className="w-3.5 h-3.5" />
                 Phone Number
               </label>
               <input 
                 name="phone" 
                 defaultValue={profile.phone} 
                 className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm" 
                 placeholder="E.g. +66 81 234 5678" 
               />
            </div>

            <div className="pt-6">
               <button 
                 disabled={saving} 
                 className="w-full flex items-center justify-center gap-3 py-5 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-orange-500 transition-all shadow-xl shadow-slate-200 hover:shadow-orange-100 disabled:opacity-50"
               >
                 {saving ? (
                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                 ) : (
                   <CloudArrowUpIcon className="w-5 h-5" />
                 )}
                 {saving ? 'Saving Information...' : 'Save Profile Details'}
               </button>
            </div>
          </form>
        </div>
      </div>
    </AgencyShell>
  );
}
