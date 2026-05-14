'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Booking, BookingStatus } from '@/types';
import AgencyShell from '@/components/agency/Shell';
import { 
  CheckIcon, 
  XMarkIcon, 
  ClockIcon,
  ArrowPathIcon,
  InboxIcon
} from '@heroicons/react/24/outline';

function asError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err ?? 'Unknown error'));
}

const StatusPill = ({ s }: { s: BookingStatus }) => {
  const map: Record<BookingStatus, string> = {
    pending: 'bg-amber-500 text-white shadow-amber-100',
    confirmed: 'bg-emerald-500 text-white shadow-emerald-100',
    cancelled: 'bg-slate-400 text-white shadow-slate-100',
  };
  
  const Icon = s === 'pending' ? ClockIcon : s === 'confirmed' ? CheckIcon : XMarkIcon;

  return (
    <span className={`inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest shadow-lg ${map[s]}`}>
      <Icon className="w-3 h-3 stroke-[3]" />
      {s}
    </span>
  );
};

export default function AgencyBookingsPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Booking[]>('/api/users/agency/bookings/')
      .then((d) => setItems(d))
      .catch((err: unknown) => setMsg(asError(err).message || 'Load failed'))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: number, status: BookingStatus) => {
    try {
      await api.patch<Booking>(`/api/users/agency/bookings/${id}/status/`, { status });
      setItems((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    } catch (err: unknown) {
      alert(asError(err).message || 'Update failed');
    }
  };

  return (
    <AgencyShell>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Customer <span className="text-orange-500">Bookings</span>
            </h1>
            <p className="text-slate-500 font-medium">Review and manage your tour reservations.</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white px-4 py-2 rounded-xl border border-slate-200">
             <span>Total: {items.length} Bookings</span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100">
             <ArrowPathIcon className="w-12 h-12 text-orange-500 animate-spin mb-4" />
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing bookings...</p>
          </div>
        ) : msg ? (
          <div className="bg-red-50 border border-red-100 p-10 rounded-[2.5rem] text-center text-red-600 font-bold shadow-sm">{msg}</div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 overflow-hidden">
            {/* Table Header - Desktop Only */}
            <div className="hidden md:grid grid-cols-12 gap-4 border-b border-slate-100 bg-slate-50 px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <div className="col-span-4">Tour Package</div>
              <div className="col-span-2">Travel Date</div>
              <div className="col-span-2 text-center">Travelers</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            <ul className="divide-y divide-slate-50">
              {items.map((b) => (
                <li key={b.id} className="flex flex-col md:grid md:grid-cols-12 items-start md:items-center gap-6 md:gap-4 px-6 md:px-8 py-8 text-sm group hover:bg-slate-50/50 transition-colors">
                  {/* Package & Status (Mobile Header) */}
                  <div className="w-full md:col-span-4 flex items-start justify-between md:block">
                    <div>
                      <div className="font-black text-slate-900 text-base leading-tight group-hover:text-orange-500 transition-colors">{b.package.title}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{b.package.location}</div>
                    </div>
                    <div className="md:hidden shrink-0">
                      <StatusPill s={b.status} />
                    </div>
                  </div>

                  {/* Travel Date */}
                  <div className="w-full md:col-span-2 flex items-center justify-between md:block border-t border-slate-50 pt-4 md:border-none md:pt-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest md:hidden">Travel Date</span>
                    <div className="font-bold text-slate-700">{b.travel_date}</div>
                  </div>

                  {/* Travelers */}
                  <div className="w-full md:col-span-2 flex items-center justify-between md:block md:text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest md:hidden">Travelers</span>
                    <span className="bg-slate-100 text-slate-900 px-3 py-1 rounded-lg font-black text-xs">
                       {b.number_of_people} {b.number_of_people > 1 ? 'People' : 'Person'}
                    </span>
                  </div>

                  {/* Status (Desktop) */}
                  <div className="hidden md:block md:col-span-2 text-center">
                    <StatusPill s={b.status} />
                  </div>

                  {/* Actions */}
                  <div className="w-full md:col-span-2 flex items-center justify-between md:justify-end gap-3 border-t border-slate-50 pt-4 md:border-none md:pt-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest md:hidden">Quick Actions</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(b.id, 'confirmed')}
                        className="w-10 h-10 md:w-9 md:h-9 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-emerald-500 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm"
                        title="Confirm"
                      >
                        <CheckIcon className="w-5 h-5 stroke-[2.5]" />
                      </button>
                      <button
                        onClick={() => updateStatus(b.id, 'cancelled')}
                        className="w-10 h-10 md:w-9 md:h-9 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
                        title="Cancel"
                      >
                        <XMarkIcon className="w-5 h-5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center p-20 text-slate-400 gap-4">
                 <InboxIcon className="w-12 h-12 opacity-20" />
                 <p className="italic font-medium text-sm text-center">No bookings found for your packages.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AgencyShell>
  );
}
