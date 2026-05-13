'use client';

import { useEffect, useState } from 'react';
import AgencyShell from '@/components/agency/Shell';
import Link from 'next/link';
import { api } from '@/lib/api';
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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch stats with cache buster to ensure fresh data
    api.get<DashboardStats>(`/api/users/agency/stats/?t=${Date.now()}`)
      .then(setStats)
      .catch((err) => {
        console.error('❌ Dashboard API error:', err);
        setError(err.message || 'Failed to load stats');
      })
      .finally(() => setLoading(false));
  }, []);

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
  }

  return (
    <AgencyShell>
      <div className="space-y-10">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Hello, <span className="text-orange-500">Partner!</span>
            </h1>
            <p className="text-slate-500 font-medium mt-2">Here&apos;s what&apos;s happening with your travel business today.</p>
          </div>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-900 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                <ArrowDownTrayIcon className="w-4 h-4" />
                Download Report
             </button>
             <Link href="/agency/packages/create" className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-orange-500 transition-all shadow-lg shadow-slate-200">
                <PlusIcon className="w-4 h-4" />
                New Package
             </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 group hover:border-orange-500 transition-all">
                <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm bg-blue-50 text-blue-600">
                      <ArchiveBoxIcon className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Packages</span>
                </div>
                <div className="text-3xl font-black text-slate-900 mb-2">{stats?.packages_count || 0}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active collections</div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 group hover:border-orange-500 transition-all">
                <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm bg-orange-50 text-orange-600">
                      <CalendarDaysIcon className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Bookings</span>
                </div>
                <div className="text-3xl font-black text-slate-900 mb-2">{stats?.bookings_count || 0}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Across all tours</div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 group hover:border-orange-500 transition-all">
                <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm bg-green-50 text-green-600">
                      <BanknotesIcon className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Revenue</span>
                </div>
                <div className="text-3xl font-black text-slate-900 mb-2">฿{(stats?.total_revenue || 0).toLocaleString()}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confirmed earnings</div>
            </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           {/* Recent Activities */}
           <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-xl shadow-slate-100">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-black text-slate-900 tracking-tight">Recent Activities</h2>
                 <Link href="/agency/bookings" className="text-[10px] font-black text-orange-500 uppercase tracking-widest hover:underline">View All</Link>
              </div>
              <div className="space-y-6">
                 {stats?.activities.length === 0 ? (
                   <div className="py-10 text-center text-slate-400 italic text-sm">No recent activities found.</div>
                 ) : stats?.activities.map((act) => {
                    let Icon = SparklesIcon;
                    let color = 'text-orange-500';
                    
                    if (act.status === 'confirmed') {
                        Icon = CheckCircleIcon;
                        color = 'text-emerald-500';
                    } else if (act.status === 'cancelled') {
                        Icon = CheckCircleIcon; // Should be X but reusing for now
                        color = 'text-red-500';
                    }

                    return (
                      <div key={act.id} className="flex items-center gap-4 group cursor-pointer p-2 rounded-2xl hover:bg-slate-50 transition-all">
                         <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Icon className={cx("w-6 h-6", color)} />
                         </div>
                         <div className="flex-1">
                            <div className="text-sm font-black text-slate-900">{act.title}</div>
                            <div className="text-xs font-medium text-slate-500 mt-0.5">{act.desc}</div>
                         </div>
                         <div className="text-[10px] font-bold text-slate-400 uppercase">{timeAgo(act.time)}</div>
                      </div>
                    );
                 })}
              </div>
           </div>

           {/* Quick Tips/Promo */}
           <div className="flex flex-col gap-10">
              <div className="bg-orange-500 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-orange-100">
                 <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                 <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                       <PhotoIcon className="w-8 h-8 text-white/80" />
                       <h3 className="text-2xl font-black leading-tight">Boost your <br/>Visibility!</h3>
                    </div>
                    <p className="mt-4 text-sm font-medium opacity-90 leading-relaxed">
                       Add high-quality photos to your tour packages to increase booking rates by up to 40%.
                    </p>
                    <Link href="/agency/packages" className="inline-block mt-8 bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all">
                       Upload Photos
                    </Link>
                 </div>
              </div>

              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                       <QuestionMarkCircleIcon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-black tracking-tight">Need Help?</h3>
                 </div>
                 <p className="text-slate-400 text-sm font-medium leading-relaxed">
                    Our support team is available 24/7 to help you manage your agency profile.
                 </p>
                 <button className="mt-8 border border-slate-700 text-white w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">
                    Contact Support
                 </button>
              </div>
           </div>
        </div>
      </div>
    </AgencyShell>
  );
}