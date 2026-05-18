'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  InformationCircleIcon, 
  CalendarDaysIcon, 
  PhotoIcon,
  RocketLaunchIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import AgencyShell from '@/components/agency/Shell';

function asError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err ?? 'Unknown error'));
}

export default function CreatePackagePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [available, setAvailable] = useState(true);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');

    const formEl = e.currentTarget;
    const fd = new FormData(formEl);
    fd.set('available', String(available));

    const imagesInput = formEl.elements.namedItem('images') as HTMLInputElement | null;
    if (imagesInput?.files?.length) {
      fd.delete('images');
      Array.from(imagesInput.files).forEach((f) => fd.append('images', f));
    }

    try {
      await api.post<unknown>('/api/users/agency/packages/create/', fd);
      router.push('/agency/packages');
    } catch (err: unknown) {
      setMsg(asError(err).message || 'Create failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AgencyShell>
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div className="space-y-2">
             <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
               Create <span className="text-orange-500">New Package</span>
             </h1>
             <p className="text-sm md:text-base text-slate-500 font-medium">Design an unforgettable journey for your customers.</p>
           </div>
           <Link href="/agency/packages" className="w-fit flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 transition-colors group bg-white px-4 py-2 rounded-xl border border-slate-100 md:bg-transparent md:p-0 md:border-none">
              <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to List
           </Link>
        </div>

        {msg && (
          <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-red-600 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-sm mx-4 md:mx-0">
             <ExclamationTriangleIcon className="w-5 h-5" />
             {msg}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-8 md:space-y-10">
          {/* Main Info Section */}
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 p-6 md:p-12 space-y-8 mx-1 md:mx-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-50 pb-6 gap-4">
               <div className="flex items-center gap-3">
                  <InformationCircleIcon className="w-6 h-6 text-orange-500" />
                  <h2 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-widest">General Information</h2>
               </div>
               <div className="flex items-center justify-between sm:justify-end gap-4 bg-slate-50 p-3 rounded-2xl sm:bg-transparent sm:p-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Set as Available</span>
                  <button
                    type="button"
                    onClick={() => setAvailable((v) => !v)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all shadow-inner ${
                      available ? 'bg-orange-500' : 'bg-slate-200'
                    }`}
                  >
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-all shadow-md ${
                        available ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
               </div>
            </div>

            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Package Title</label>
                  <input name="title" placeholder="E.g. Swiss Alps Adventure 2026" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm" required />
               </div>
               
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Description</label>
                  <textarea name="description" placeholder="Describe the amazing journey..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm min-h-[150px]" required />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Price (THB)</label>
                     <input name="price" type="number" step="0.01" placeholder="9,999" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm" required />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Location</label>
                     <input name="location" placeholder="E.g. Zurich, Switzerland" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm" required />
                  </div>
               </div>
            </div>
          </div>

          {/* Logistics & Timeline */}
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 p-6 md:p-12 space-y-8 mx-1 md:mx-0">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
               <CalendarDaysIcon className="w-6 h-6 text-orange-500" />
               <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Logistics & Timeline</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Start Date</label>
                     <input name="start_date" type="date" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm" required />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">End Date</label>
                     <input name="end_date" type="date" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm" required />
                  </div>
               </div>
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Total Slots</label>
                     <input name="slots" type="number" min={1} placeholder="20" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm" required />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Duration Detail</label>
                     <input name="duration_detail" placeholder="E.g. 5 Days 4 Nights" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm" />
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Languages</label>
                  <input name="languages" placeholder="E.g. EN, TH, JP" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Group Size</label>
                  <input name="group_size" placeholder="E.g. Max 10 people" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm" />
               </div>
            </div>
          </div>

          {/* Media & Details */}
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 p-6 md:p-12 space-y-10 mx-1 md:mx-0">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
               <PhotoIcon className="w-6 h-6 text-orange-500" />
               <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Media & Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Cover Image</label>
                  <input name="image" type="file" accept="image/jpeg,image/png,image/webp" className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Map Image</label>
                  <input name="map_image" type="file" accept="image/jpeg,image/png,image/webp" className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Gallery (Multi)</label>
                  <input name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-purple-50 file:text-purple-600 hover:file:bg-purple-100" />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Activities</label>
                  <textarea name="activities" placeholder="Hiking, Dinner, Boat tour..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Includes</label>
                  <textarea name="includes" placeholder="Hotel, Transfer, Meals..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Excludes</label>
                  <textarea name="excludes" placeholder="Personal exp, Flight..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm" />
               </div>
            </div>

            <div className="pt-10 border-t border-slate-50">
               <button
                 disabled={saving}
                 className="w-full flex items-center justify-center gap-3 py-6 bg-slate-900 text-white font-black text-sm uppercase tracking-[0.3em] rounded-3xl hover:bg-orange-500 transition-all shadow-2xl shadow-slate-200 hover:shadow-orange-100 disabled:opacity-50"
               >
                 {saving ? (
                   <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" />
                 ) : (
                   <RocketLaunchIcon className="w-6 h-6" />
                 )}
                 {saving ? 'Creating Package...' : 'Launch Package Now'}
               </button>
            </div>
          </div>
        </form>
      </div>
    </AgencyShell>
  );
}
