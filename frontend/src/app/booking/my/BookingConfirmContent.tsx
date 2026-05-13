'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  CalendarDaysIcon,
  UsersIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  MapPinIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useCurrency } from '@/providers/CurrencyProvider';
import { api, API_BASE } from '@/lib/api';
import { toast, Toaster } from 'react-hot-toast';

type BookingStatusRaw = 'pending' | 'confirmed' | 'canceled' | 'cancelled' | string;

interface Booking {
  id: number;
  travel_date: string;
  number_of_people: number;
  status: BookingStatusRaw;
  package: {
    id: number;
    title: string;
    price: string;   
    location: string;
  };
}

export default function BookingConfirmContent() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'confirmed' | 'canceled'>('pending'); 
  const { format } = useCurrency();

  const normStatus = (s: BookingStatusRaw) =>
    (s || '').toLowerCase() === 'cancelled' ? 'canceled' : (s || '').toLowerCase();

  const getStatusBadge = (s: BookingStatusRaw) => {
    const n = normStatus(s);
    if (n === 'confirmed') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm shadow-emerald-50">
          <CheckCircleIcon className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Paid & Confirmed</span>
        </div>
      );
    }
    if (n === 'canceled') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 shadow-sm shadow-rose-50">
          <XCircleIcon className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Canceled</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shadow-sm shadow-amber-50">
        <ClockIcon className="w-4 h-4" />
        <span className="text-[10px] font-black uppercase tracking-widest">Pending Verification</span>
      </div>
    );
  };

  const fetchMyBookings = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await api.get<Booking[]>('/api/users/bookings/my/');
      setBookings(data);
    } catch (err: any) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyBookings();
    const id = setInterval(() => fetchMyBookings(true), 30000); 
    return () => clearInterval(id);
  }, [fetchMyBookings]);

  const filtered = useMemo(() => {
    return bookings.filter((b) => normStatus(b.status) === filter);
  }, [bookings, filter]);

  const handleDownloadPDF = async (bookingId: number) => {
    try {
      const token = localStorage.getItem('access');
      if (!token) throw new Error('Unauthorized');
      
      const res = await fetch(`${API_BASE}/users/bookings/${bookingId}/pdf/`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('PDF download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `booking_${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Receipt downloaded!');
    } catch {
      toast.error('Failed to download PDF.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 font-sans">
      <Toaster position="top-center" />
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">My <span className="text-orange-500">Bookings</span></h1>
            <p className="text-slate-500 font-medium mt-2 uppercase tracking-widest text-[10px]">Track your journey and download receipts</p>
          </div>
          <button
            onClick={() => fetchMyBookings()}
            className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl shadow-slate-200/50 active:scale-95"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh List
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-slate-200/50 p-1.5 rounded-2xl w-fit mb-10 border border-slate-200 shadow-inner">
          {([
            { key: 'pending', label: 'Pending' },
            { key: 'confirmed', label: 'Confirmed' },
            { key: 'canceled', label: 'Canceled' },
          ] as const).map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  active 
                    ? 'bg-white text-slate-900 shadow-xl shadow-slate-200' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* List Section */}
        {loading && bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
             <ArrowPathIcon className="w-10 h-10 text-orange-500 animate-spin" />
             <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Finding your trips...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-100 shadow-2xl shadow-slate-200/50">
             <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <CalendarDaysIcon className="w-10 h-10 text-slate-300" />
             </div>
             <h3 className="text-xl font-black text-slate-900 tracking-tight">No Bookings Found</h3>
             <p className="text-slate-500 font-medium mt-2">You don&apos;t have any {filter} bookings at the moment.</p>
             <Link href="/packagesList" className="inline-block mt-8 bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl">
                Explore Packages
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {filtered.map((b) => {
              const totalAmount = Number(b.package.price || 0) * b.number_of_people;
              return (
                <div
                  key={b.id}
                  className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-8 md:p-10 border border-slate-100 group hover:border-orange-200 transition-all duration-500"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-8">
                    
                    {/* Package Info */}
                    <div className="flex-1 space-y-6">
                       <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                          <MapPinIcon className="w-4 h-4 text-orange-500" />
                          {b.package.location || 'Explore Destination'}
                       </div>
                       
                       <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-orange-500 transition-colors">
                         {b.package.title}
                       </h2>
                       
                       <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4">
                          <div className="space-y-1">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <CalendarDaysIcon className="w-3.5 h-3.5" /> Travel Date
                             </p>
                             <p className="text-sm font-bold text-slate-700">{new Date(b.travel_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <UsersIcon className="w-3.5 h-3.5" /> Guests
                             </p>
                             <p className="text-sm font-bold text-slate-700">{b.number_of_people} Person(s)</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <BanknotesIcon className="w-3.5 h-3.5" /> Total Price
                             </p>
                             <p className="text-lg font-black text-slate-900">{format(totalAmount)}</p>
                          </div>
                       </div>
                    </div>

                    {/* Actions & Status */}
                    <div className="md:w-64 flex flex-col items-center md:items-end justify-between gap-6 border-t md:border-t-0 md:border-l border-slate-50 pt-6 md:pt-0 md:pl-10">
                       <div className="mb-4">
                          {getStatusBadge(b.status)}
                       </div>
                       
                       <div className="flex flex-col w-full gap-3">
                          <Link 
                            href={`/packages/${b.package.id}`}
                            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-slate-50 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
                          >
                             View Package
                             <ChevronRightIcon className="w-4 h-4" />
                          </Link>
                          {normStatus(b.status) === 'confirmed' && (
                             <button
                               onClick={() => handleDownloadPDF(b.id)}
                               className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl shadow-slate-200 hover:shadow-orange-200"
                             >
                                <DocumentArrowDownIcon className="w-4 h-4" />
                                Download Receipt
                             </button>
                          )}
                       </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
