'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  IdentificationIcon,
  GlobeAsiaAustraliaIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  ChatBubbleBottomCenterTextIcon,
  CreditCardIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  passport: string;
  nationality: string;
  gender: string;
  dob: string;
  note: string;
  agencyRef: string; 
};

const NATIONALITIES = [
  'Thai', 'Japanese', 'Korean', 'Chinese', 'American', 
  'British', 'Australian', 'French', 'German', 'Other',
];

export default function ConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('booking_id');

  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    phone: '',
    passport: '',
    nationality: '',
    gender: '',
    dob: '',
    note: '',
    agencyRef: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null;
    if (!token) return;

    api.get<any>('/api/users/profile/')
      .then((data) => {
        setForm((prev) => ({
          ...prev,
          fullName: data.username || '',
          email: data.email || '',
          phone: data.phone || '',
          passport: data.passport_no || '',
          nationality: data.nationality || '',
          gender: data.gender || '',
          dob: data.birth_date || '',
        }));
      })
      .catch(() => console.error('❌ Error loading profile'));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleConfirm = async () => {
    const token = localStorage.getItem('access');
    if (!token || !bookingId) {
      setMessage('❌ Please log in first.');
      return;
    }

    setLoading(true);
    const fullNote = `
Name: ${form.fullName}
Email: ${form.email}
Phone: ${form.phone}
Passport: ${form.passport}
Gender: ${form.gender || '-'}
Nationality: ${form.nationality}
Date of Birth: ${form.dob}
Agency Referral No.: ${form.agencyRef || '-'}
Note: ${form.note || '-'}
    `.trim();

    try {
      await api.put(`/api/users/bookings/update/${bookingId}/`, { note: fullNote });
      setMessage('✅ Information saved successfully!');
      setTimeout(() => {
        router.push(`/payment?booking_id=${bookingId}`);
      }, 1200);
    } catch (err: any) {
      setMessage(`❌ ${err.message || 'Failed to save booking information.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-12">
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Confirm <span className="text-orange-500">Booking</span>
           </h1>
           <p className="text-slate-500 font-medium mt-2">Please double-check and complete your travel information.</p>
        </div>

        <div className="bg-white shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden border border-slate-100">
          <div className="p-8 md:p-12">
            
            {/* Form Sections */}
            <div className="space-y-10">
               
               {/* Section: Personal Info */}
               <div>
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                     <UserIcon className="w-5 h-5 text-slate-400" />
                     <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Personal Information</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                        <div className="relative group">
                           <input
                             name="fullName"
                             type="text"
                             value={form.fullName}
                             onChange={handleChange}
                             placeholder="e.g. Jane Doe"
                             className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                           />
                        </div>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative group">
                           <input
                             name="email"
                             type="email"
                             value={form.email}
                             onChange={handleChange}
                             placeholder="you@example.com"
                             className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                           />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Section: Contact & Identity */}
               <div>
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                     <IdentificationIcon className="w-5 h-5 text-slate-400" />
                     <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Identity & Contact</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                        <input
                          name="phone"
                          type="text"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="+66 8x xxxx xxx"
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Passport / ID Number</label>
                        <input
                          name="passport"
                          type="text"
                          value={form.passport}
                          onChange={handleChange}
                          placeholder="e.g. AA1234567"
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                        <select
                          name="gender"
                          value={form.gender}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 transition-all appearance-none cursor-pointer"
                        >
                          <option value="">— Select gender —</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nationality</label>
                        <select
                          name="nationality"
                          value={form.nationality}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 transition-all appearance-none cursor-pointer"
                        >
                          <option value="">— Select nationality —</option>
                          {NATIONALITIES.map((n) => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                     </div>
                  </div>
               </div>

               {/* Section: Extra Info */}
               <div>
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                     <CalendarDaysIcon className="w-5 h-5 text-slate-400" />
                     <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Additional Details</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                        <input
                          name="dob"
                          type="date"
                          value={form.dob}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Agency Referral (Optional)</label>
                        <input
                          name="agencyRef"
                          type="text"
                          value={form.agencyRef}
                          onChange={handleChange}
                          placeholder="e.g. AGC-2024-001"
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                        />
                     </div>
                  </div>
                  <div className="mt-6 space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Additional Notes</label>
                     <textarea
                       name="note"
                       rows={4}
                       value={form.note}
                       onChange={handleChange}
                       placeholder="Dietary requirements, special requests, etc."
                       className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none"
                     />
                  </div>
               </div>
            </div>

            {/* Submit Action */}
            <div className="mt-12 flex flex-col items-center">
               {message && (
                 <div className={`w-full mb-8 px-6 py-4 rounded-2xl font-bold text-sm text-center ${message.startsWith('✅') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {message}
                 </div>
               )}
               
               <button
                 onClick={handleConfirm}
                 disabled={loading}
                 className="group w-full md:w-auto md:min-w-[300px] bg-slate-900 text-white py-5 px-12 rounded-2xl font-black text-xs uppercase tracking-[0.25em] transition-all hover:bg-orange-500 shadow-xl shadow-slate-200 hover:shadow-orange-200 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
               >
                 {loading ? 'Processing...' : (
                   <>
                     Proceed to Payment
                     <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                   </>
                 )}
               </button>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6">Next Step: Payment & Confirmation</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
