'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { 
  TicketIcon, 
  CalendarDaysIcon, 
  UsersIcon,
  QrCodeIcon,
  CloudArrowUpIcon,
  BanknotesIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useCurrency } from '@/providers/CurrencyProvider';

interface BookingData {
  id: number;
  travel_date: string;
  number_of_people: number;
  package: {
    title: string;
    price: string; 
  };
}

const MAX_SLIP_SIZE_MB = 5;

export default function PaymentClientPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('booking_id');

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [method, setMethod] = useState<'qr' | 'slip'>('qr');
  const [message, setMessage] = useState('');
  const [slip, setSlip] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { format } = useCurrency();

  useEffect(() => {
    if (!bookingId) return;
    api.get<BookingData>(`/api/users/bookings/${bookingId}/`)
      .then(setBooking)
      .catch(() => setMessage('❌ Booking not found'));
  }, [bookingId]);

  const handleSlipUpload = async () => {
    if (!bookingId || !slip) {
      setMessage('❌ Please attach a payment slip.');
      return;
    }

    setUploading(true);
    setMessage('');
    const formData = new FormData();
    formData.append('booking_id', bookingId);
    formData.append('slip_image', slip);

    try {
      await api.post('/api/users/payments/upload/', formData);
      setMessage('✅ Slip uploaded successfully!');
      
      // Notify email in background
      api.post('/api/users/payments/notify/', { booking_id: Number(bookingId) }).catch(() => {});
      
      setTimeout(() => router.push(`/booking/success?booking_id=${bookingId}`), 1200);
    } catch (err: any) {
      setMessage(`❌ ${err.message || 'Failed to upload slip.'}`);
    } finally {
      setUploading(false);
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <ArrowPathIcon className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Securing your connection...</p>
      </div>
    );
  }

  const totalTHB = Number(booking.package?.price || 0) * booking.number_of_people;
  const localQrSrc = '/images/ae08771f-baaa-4bdb-9502-ba26de426bfa.jpg';

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-5 gap-10">
        
        {/* Left Side: Summary Card */}
        <div className="lg:col-span-2">
           <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-8 border border-slate-100 sticky top-28">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                    <TicketIcon className="w-6 h-6" />
                 </div>
                 <h2 className="text-xl font-black text-slate-900 tracking-tight">Order Summary</h2>
              </div>

              <div className="space-y-6">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tour Package</p>
                    <p className="text-base font-black text-slate-900 line-clamp-2">{booking.package?.title}</p>
                 </div>

                 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <CalendarDaysIcon className="w-3.5 h-3.5" /> Date
                       </p>
                       <p className="text-sm font-bold text-slate-700">{booking.travel_date}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <UsersIcon className="w-3.5 h-3.5" /> Travelers
                       </p>
                       <p className="text-sm font-bold text-slate-700">{booking.number_of_people} Person(s)</p>
                    </div>
                 </div>

                 <div className="bg-slate-50 rounded-2xl p-6 mt-8 border border-slate-100 shadow-inner">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-xs font-bold text-slate-400">Total Amount</span>
                       <span className="text-xs font-bold text-slate-400">VAT Included</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 tracking-tight">
                       {format(totalTHB)}
                    </div>
                 </div>

                 <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                    <InformationCircleIcon className="w-5 h-5 text-orange-500 shrink-0" />
                    <p className="text-[10px] font-bold text-orange-700 leading-relaxed uppercase">
                       Please complete payment within 24 hours to secure your booking.
                    </p>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Side: Payment Methods */}
        <div className="lg:col-span-3">
           <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-8 md:p-12 border border-slate-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                 <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Secure Payment</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Select your preferred payment method.</p>
                 </div>
                 <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                    <button 
                      onClick={() => setMethod('qr')}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${method === 'qr' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                       <QrCodeIcon className="w-4 h-4" /> QR Pay
                    </button>
                    <button 
                      onClick={() => setMethod('slip')}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${method === 'slip' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                       <CloudArrowUpIcon className="w-4 h-4" /> Upload
                    </button>
                 </div>
              </div>

              {/* QR Method */}
              {method === 'qr' && (
                 <div className="flex flex-col items-center animate-in fade-in duration-500">
                    <div className="relative group">
                       <div className="absolute -inset-4 bg-slate-100 rounded-[3rem] -z-10 transition-all group-hover:bg-orange-50" />
                       <Image
                         src={localQrSrc}
                         alt="QR PromptPay"
                         width={300}
                         height={300}
                         className="bg-white p-4 rounded-[2.5rem] shadow-xl border border-slate-100"
                         priority
                       />
                       <div className="absolute bottom-4 right-4 bg-orange-500 text-white p-2 rounded-xl shadow-lg">
                          <BanknotesIcon className="w-5 h-5" />
                       </div>
                    </div>
                    <div className="mt-12 text-center space-y-3">
                       <h3 className="text-lg font-black text-slate-900 tracking-tight">Scan with Bank App</h3>
                       <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
                          Scan this QR Code to pay via <strong>PromptPay</strong> or any mobile banking app.
                       </p>
                       <div className="pt-6">
                          <button 
                            onClick={() => setMethod('slip')}
                            className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl shadow-slate-200"
                          >
                             Already Paid? Upload Slip
                          </button>
                       </div>
                    </div>
                 </div>
              )}

              {/* Slip Method */}
              {method === 'slip' && (
                 <div className="animate-in slide-in-from-right-4 fade-in duration-500">
                    <div className="mb-10 p-10 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50 hover:bg-white hover:border-orange-500 transition-all group relative text-center">
                       <input
                         type="file"
                         accept=".jpg,.jpeg,.png,.webp"
                         onChange={(e) => {
                           const f = e.target.files?.[0] || null;
                           setMessage('');
                           if (!f) return setSlip(null);
                           setSlip(f);
                         }}
                         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                       />
                       <div className="flex flex-col items-center">
                          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-6 group-hover:scale-110 transition-transform">
                             <CloudArrowUpIcon className="w-10 h-10 text-slate-300 group-hover:text-orange-500" />
                          </div>
                          <h4 className="text-lg font-black text-slate-900 mb-2">
                             {slip ? 'Slip Attached!' : 'Upload Transfer Slip'}
                          </h4>
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                             {slip ? `${slip.name} (${(slip.size / (1024 * 1024)).toFixed(2)} MB)` : 'JPG, PNG or WEBP (Max 5MB)'}
                          </p>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <button
                         onClick={handleSlipUpload}
                         disabled={!slip || uploading}
                         className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.25em] transition-all hover:bg-orange-500 shadow-xl shadow-slate-200 disabled:opacity-30 flex items-center justify-center gap-3"
                       >
                         {uploading ? 'Processing Slip...' : (
                           <>
                              <CheckCircleIcon className="w-5 h-5" />
                              Confirm Slip Upload
                           </>
                         )}
                       </button>
                       
                       {message && (
                         <div className={`w-full px-6 py-4 rounded-2xl font-bold text-sm text-center ${message.startsWith('✅') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {message}
                         </div>
                       )}
                    </div>
                 </div>
              )}

           </div>
        </div>
      </div>
    </div>
  );
}
