'use client';

import { useEffect, useState } from 'react';
import AgencyShell from '@/components/agency/Shell';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { 
  ArchiveBoxIcon, 
  CalendarDaysIcon, 
  BanknotesIcon,
  SparklesIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  ChatBubbleLeftEllipsisIcon,
  PhotoIcon,
  QuestionMarkCircleIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface Activity {
  id: number;
  type: string;
  title: string;
  desc: string;
  time: string;
  status: string;
}

interface DashboardStats {
  packages_count: number;
  bookings_count: number;
  total_revenue: number;
  activities: Activity[];
}

function cx(...cls: (string | false | undefined)[]) {
  return cls.filter(Boolean).join(' ');
}

/** Simple time ago formatter */
function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export default function AgencyDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch stats with cache buster to ensure fresh data
    api.get<DashboardStats>(`/api/users/agency/stats/?t=${Date.now()}`)
      .then(setStats)
      .catch((err) => {
        console.error('❌ Dashboard API error:', err);
        const errMsg = err.message || '';
        if (errMsg.includes('401') || errMsg.includes('credentials') || errMsg.includes('not provided')) {
          router.replace('/login');
        } else {
          setError(errMsg || 'Failed to load stats');
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <AgencyShell>
        <div className="flex flex-col items-center justify-center py-40">
          <ArrowPathIcon className="w-12 h-12 text-orange-500 animate-spin mb-4" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing Dashboard Data...</p>
        </div>
      </AgencyShell>
    );
  }

  if (error) {
    return (
      <AgencyShell>
        <div className="p-10 bg-red-50 border border-red-100 rounded-[2.5rem] text-center text-red-600 font-bold">
           {error}
        </div>
      </AgencyShell>
    );
  }  return (
    <AgencyShell>
      <div className="space-y-10">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              สวัสดีครับ, <span className="text-orange-500">Partner! 👋</span>
            </h1>
            <p className="text-slate-500 font-medium mt-2">นี่คือข้อมูลสรุปและสถานะทางธุรกิจของคุณในวันนี้นะครับ</p>
          </div>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                <ArrowDownTrayIcon className="w-4 h-4" />
                ดาวน์โหลดรายงาน
             </button>
             <Link href="/agency/packages/create" className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-orange-500 hover:scale-105 transition-all shadow-lg shadow-slate-200">
                <PlusIcon className="w-4 h-4 text-orange-400" />
                สร้างแพ็กเกจใหม่
             </Link>
          </div>
        </div>

        {/* Travelie-style Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Stats Card 1: Active Bookings */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/40 relative overflow-hidden group hover:border-orange-500/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-500">
                      <CalendarDaysIcon className="w-7 h-7" />
                    </div>
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                      +2.98%
                    </span>
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Bookings</div>
                <div className="text-3xl font-black text-slate-900 mt-2">{stats?.bookings_count || 0}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Across all active tours</div>
            </div>

            {/* Stats Card 2: Active Packages */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/40 relative overflow-hidden group hover:border-orange-500/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-orange-50 text-orange-500">
                      <ArchiveBoxIcon className="w-7 h-7" />
                    </div>
                    <span className="bg-orange-50 text-orange-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Live
                    </span>
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Packages</div>
                <div className="text-3xl font-black text-slate-900 mt-2">{stats?.packages_count || 0}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Active tour collections</div>
            </div>

            {/* Stats Card 3: Revenue */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/40 relative overflow-hidden group hover:border-orange-500/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-50 text-emerald-500">
                      <BanknotesIcon className="w-7 h-7" />
                    </div>
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                      +3.75%
                    </span>
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Revenue</div>
                <div className="text-3xl font-black text-slate-900 mt-2">฿{(stats?.total_revenue || 0).toLocaleString()}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Confirmed gross earnings</div>
            </div>
        </div>

        {/* Travelie Booking Status Breakdown (Total Trips bar) */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-xl shadow-slate-100/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">สรุปสัดส่วนการจองทัวร์ (Trips Status Breakdown)</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">วิเคราะห์ตามสัดส่วนประเภทสถานะการจองทั้งหมด</p>
            </div>
            <div className="text-2xl font-black text-slate-900 flex items-baseline gap-1">
              {stats?.bookings_count || 0} <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bookings</span>
            </div>
          </div>
          
          {/* Stacked Progress Bar */}
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex mb-6">
            <div className="bg-emerald-500 h-full transition-all" style={{ width: '60%' }} />
            <div className="bg-orange-500 h-full transition-all" style={{ width: '30%' }} />
            <div className="bg-rose-500 h-full transition-all" style={{ width: '10%' }} />
          </div>
          
          {/* Status Indicators Legend */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 border-t border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/20" />
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-800">Confirmed (60%)</span>
                <span className="text-[10px] font-bold text-slate-400">อนุมัติเรียบร้อยแล้ว</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-orange-500 shadow-md shadow-orange-500/20" />
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-800">Pending (30%)</span>
                <span className="text-[10px] font-bold text-slate-400">รอการตรวจสอบชำระเงิน</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-md shadow-rose-500/20" />
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-800">Cancelled (10%)</span>
                <span className="text-[10px] font-bold text-slate-400">ยกเลิกรายการแล้ว</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           {/* Recent Activities styled as Travelie Feed */}
           <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-xl shadow-slate-100/40">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-lg font-black text-slate-900 tracking-tight">การจองล่าสุด (Recent Activity)</h2>
                 <Link href="/agency/bookings" className="text-[10px] font-black text-orange-500 uppercase tracking-widest hover:underline">ดูทั้งหมด</Link>
              </div>
              <div className="space-y-4">
                 {stats?.activities.length === 0 ? (
                   <div className="py-10 text-center text-slate-400 italic text-sm">ไม่พบประวัติการจองทัวร์ล่าสุด</div>
                 ) : stats?.activities.map((act) => {
                    let dotColor = 'bg-orange-500';
                    let statusLabel = 'Pending';
                    let textColor = 'text-orange-600 bg-orange-50';
                    
                    if (act.status === 'confirmed') {
                        dotColor = 'bg-emerald-500';
                        statusLabel = 'Confirmed';
                        textColor = 'text-emerald-600 bg-emerald-50';
                    } else if (act.status === 'cancelled') {
                        dotColor = 'bg-rose-500';
                        statusLabel = 'Cancelled';
                        textColor = 'text-rose-600 bg-rose-50';
                    }

                    return (
                      <div key={act.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-all duration-200">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm shadow-sm shrink-0">
                               🗺️
                            </div>
                            <div>
                               <div className="text-sm font-black text-slate-800 leading-snug">{act.title}</div>
                               <div className="text-xs font-medium text-slate-400 mt-1">{act.desc}</div>
                            </div>
                         </div>
                         <div className="flex items-center justify-between sm:justify-end gap-4">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{timeAgo(act.time)}</span>
                            <div className="flex items-center gap-2">
                               <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                               <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${textColor}`}>
                                 {statusLabel}
                               </span>
                            </div>
                         </div>
                      </div>
                    );
                 })}
              </div>
           </div>

           {/* Quick Tips/Promo styled as Premium Cards */}
           <div className="flex flex-col gap-8">
              {/* Promo Card 1: Boost Visibility */}
              <div className="bg-orange-500 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-orange-100/50 group hover:scale-[1.01] transition-transform duration-300">
                 <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 bg-white/10 rounded-full blur-3xl" />
                 <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                       <PhotoIcon className="w-8 h-8 text-white/80" />
                       <h3 className="text-xl md:text-2xl font-black leading-tight">เพิ่มความโดดเด่น <br/>ให้ทัวร์ของคุณ!</h3>
                    </div>
                    <p className="mt-4 text-xs md:text-sm font-medium opacity-90 leading-relaxed max-w-md">
                       การเพิ่มภาพถ่ายทัวร์สวยๆ และคมชัด จะช่วยเพิ่มอัตราการตัดสินใจจองของนักท่องเที่ยวมากขึ้นถึง 40% เลยทีเดียว
                    </p>
                    <Link href="/agency/packages" className="inline-block mt-6 bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all shadow-md">
                       จัดการอัปโหลดภาพทัวร์
                    </Link>
                 </div>
              </div>

              {/* Promo Card 2: Need Help */}
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
                 <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 bg-orange-500/10 rounded-full blur-3xl" />
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                       <QuestionMarkCircleIcon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-black tracking-tight">ฝ่ายบริการพาร์ทเนอร์</h3>
                  </div>
                  <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed max-w-md">
                     หากคุณมีข้อสงสัยเกี่ยวกับการตั้งค่า หรือต้องการความช่วยเหลือในการลงทะเบียนแพ็กเกจทัวร์ญี่ปุ่น ทีมงานสนับสนุนของเราพร้อมช่วยเหลือคุณตลอด 24 ชั่วโมงครับ
                  </p>
                  <button className="mt-6 border border-slate-800 text-white w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">
                     ติดต่อเจ้าหน้าที่เทคนิค
                  </button>
               </div>
            </div>
         </div>
      </div>
    </AgencyShell>
  );
}