'use client';

import Link from "next/link";
import { 
  CheckCircleIcon, 
  TicketIcon, 
  ArrowRightIcon,
  HomeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-50 rounded-full blur-[120px] -z-10 opacity-60" />
      
      <div className="max-w-xl w-full text-center space-y-10">
        {/* Success Icon */}
        <div className="relative inline-block">
           <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-emerald-200 animate-in zoom-in duration-500">
              <CheckCircleIcon className="w-12 h-12 text-white stroke-[2.5]" />
           </div>
           <div className="absolute -top-4 -right-4 bg-white p-2 rounded-2xl shadow-lg animate-bounce">
              <SparklesIcon className="w-6 h-6 text-orange-500" />
           </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Booking <span className="text-orange-500">Confirmed!</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-sm mx-auto leading-relaxed">
            Thank you for choosing us. We&apos;ve received your payment slip and our team is currently verifying it.
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 text-left space-y-4">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                 <TicketIcon className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Step</p>
                 <p className="text-sm font-bold text-slate-700">Check your booking status in 1-2 hours.</p>
              </div>
           </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/booking/my"
            className="group w-full sm:w-auto bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl shadow-slate-200 hover:shadow-orange-200 flex items-center justify-center gap-3"
          >
            My Bookings
            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto bg-white border border-slate-200 text-slate-600 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
          >
            <HomeIcon className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
           An email confirmation will be sent shortly.
        </p>
      </div>
    </div>
  );
}
