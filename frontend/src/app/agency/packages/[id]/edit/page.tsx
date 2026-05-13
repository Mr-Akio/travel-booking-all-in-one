'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  InformationCircleIcon, 
  CalendarDaysIcon, 
  PhotoIcon,
  CloudArrowUpIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { api, mediaUrl } from '@/lib/api';
import type { TourPackage } from '@/types';
import AgencyShell from '@/components/agency/Shell';

function asError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err ?? 'Unknown error'));
}

function dateForInput(d?: string | null) {
  if (!d) return '';
  return d.slice(0, 10);
}

export default function EditPackagePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [item, setItem] = useState<TourPackage | null>(null);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [available, setAvailable] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await api.get<TourPackage>(`/api/users/agency/packages/${id}/`);
        setItem(data);
        setAvailable(Boolean((data as any).available));
      } catch (err: unknown) {
        setMsg(asError(err).message || 'Load failed');
      }
    })();
  }, [id]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;

    setSaving(true);
    setMsg('');

    const formEl = e.currentTarget;
    const fd = new FormData(formEl);
    fd.set('available', String(available));

    const imageInput = formEl.elements.namedItem('image') as HTMLInputElement | null;
    if (!imageInput?.files?.length) fd.delete('image');

    const mapInput = formEl.elements.namedItem('map_image') as HTMLInputElement | null;
    if (!mapInput?.files?.length) fd.delete('map_image');

    const galleryInput = formEl.elements.namedItem('images') as HTMLInputElement | null;
    if (galleryInput?.files?.length) {
      fd.delete('images');
      Array.from(galleryInput.files).forEach((f) => fd.append('images', f));
    } else {
      fd.delete('images');
    }

    try {
      await api.patch<unknown>(`/api/users/agency/packages/${id}/`, fd);
      router.push('/agency/packages');
    } catch (err: unknown) {
      setMsg(asError(err).message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AgencyShell>
      {!item ? (
        <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100">
           <ArrowPathIcon className="w-12 h-12 text-orange-500 animate-spin mb-4" />
           <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{msg || 'Loading package details...'}</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="flex items-center justify-between">
             <div className="space-y-2">
               <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                 Edit <span className="text-orange-500">Package</span>
               </h1>
               <p className="text-slate-500 font-medium">Refine your tour details for the perfect customer experience.</p>
             </div>
             <Link href="/agency/packages" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 transition-colors group">
                <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back to List
             </Link>
          </div>

          {msg && (
            <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-red-600 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-sm">
               <ExclamationTriangleIcon className="w-5 h-5" />
               {msg}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-10">
            {/* Main Info Section */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 p-8 md:p-12 space-y-8">
              <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                 <div className="flex items-center gap-3">
                    <InformationCircleIcon className="w-6 h-6 text-orange-500" />
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">General Information</h2>
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visibility Status</span>
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
                    <input 
                      name="title" 
                      defaultValue={item.title}
                      placeholder="E.g. Swiss Alps Adventure 2026" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm" 
                      required 
                    />
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Description</label>
                    <textarea 
                      name="description" 
                      defaultValue={item.description}
                      placeholder="Describe the amazing journey..." 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm min-h-[150px]" 
                      required 
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Price (THB)</label>
                       <input 
                         name="price" 
                         type="number" 
                         step="0.01" 
                         defaultValue={String(item.price ?? '')}
                         placeholder="9,999" 
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm" 
                         required 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Location</label>
                       <input 
                         name="location" 
                         defaultValue={item.location}
                         placeholder="E.g. Zurich, Switzerland" 
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm" 
                         required 
                       />
                    </div>
                 </div>
              </div>
            </div>

            {/* Logistics & Timeline */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 p-8 md:p-12 space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                 <CalendarDaysIcon className="w-6 h-6 text-orange-500" />
                 <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Logistics & Timeline</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Start Date</label>
                       <input 
                         name="start_date" 
                         type="date" 
                         defaultValue={dateForInput(item.start_date)}
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm" 
                         required 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">End Date</label>
                       <input 
                         name="end_date" 
                         type="date" 
                         defaultValue={dateForInput(item.end_date)}
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm" 
                         required 
                       />
                    </div>
                 </div>
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Total Slots</label>
                       <input 
                         name="slots" 
                         type="number" 
                         min={1} 
                         defaultValue={String(item.slots ?? 1)}
                         placeholder="20" 
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm" 
                         required 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Duration Detail</label>
                       <input 
                         name="duration_detail" 
                         defaultValue={(item as any)?.duration_detail ?? ''}
                         placeholder="E.g. 5 Days 4 Nights" 
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm" 
                       />
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Languages</label>
                    <input 
                      name="languages" 
                      defaultValue={(item as any)?.languages ?? ''}
                      placeholder="E.g. EN, TH, JP" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Group Size</label>
                    <input 
                      name="group_size" 
                      defaultValue={(item as any)?.group_size ?? ''}
                      placeholder="E.g. Max 10 people" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm" 
                    />
                 </div>
              </div>
            </div>

            {/* Media & Details */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 p-8 md:p-12 space-y-10">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                 <PhotoIcon className="w-6 h-6 text-orange-500" />
                 <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Media & Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Current Cover</label>
                    {item.image && (
                      <div className="relative h-40 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                         <img src={mediaUrl(item.image)} alt="cover" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <input name="image" type="file" accept="image/*" className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100" />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Current Map</label>
                    {(item as any)?.map_image && (
                      <div className="relative h-40 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                         <img src={mediaUrl((item as any).map_image)} alt="map" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <input name="map_image" type="file" accept="image/*" className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100" />
                 </div>
              </div>

              <div className="space-y-4 pt-6">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Update Gallery (Multiple)</label>
                <input name="images" type="file" accept="image/*" multiple className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-purple-50 file:text-purple-600 hover:file:bg-purple-100" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">* Selecting new gallery images will replace existing ones.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Activities</label>
                    <textarea 
                      name="activities" 
                      defaultValue={(item as any)?.activities?.join?.('\n') ?? ''}
                      placeholder="Hiking, Dinner..." 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Includes</label>
                    <textarea 
                      name="includes" 
                      defaultValue={(item as any)?.includes?.join?.('\n') ?? ''}
                      placeholder="Hotel, Meals..." 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Excludes</label>
                    <textarea 
                      name="excludes" 
                      defaultValue={(item as any)?.excludes?.join?.('\n') ?? ''}
                      placeholder="Personal exp..." 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm" 
                    />
                 </div>
              </div>

              <div className="pt-10 border-t border-slate-50 flex items-center justify-between gap-6">
                 <Link href="/agency/packages" className="flex-1 py-6 bg-white border border-slate-200 text-slate-600 font-black text-sm uppercase tracking-[0.3em] rounded-3xl hover:bg-slate-50 transition-all text-center">
                    Cancel
                 </Link>
                 <button
                   disabled={saving}
                   className="flex-[2] flex items-center justify-center gap-3 py-6 bg-slate-900 text-white font-black text-sm uppercase tracking-[0.3em] rounded-3xl hover:bg-orange-500 transition-all shadow-2xl shadow-slate-200 hover:shadow-orange-100 disabled:opacity-50"
                 >
                   {saving ? (
                     <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" />
                   ) : (
                     <CloudArrowUpIcon className="w-6 h-6" />
                   )}
                   {saving ? 'Syncing Changes...' : 'Save Package Changes'}
                 </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </AgencyShell>
  );
}
