'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PropsWithChildren, useEffect, useState } from 'react';
import Image from 'next/image';
import { 
  Squares2X2Icon, 
  ArchiveBoxIcon, 
  CalendarDaysIcon, 
  UserCircleIcon,
  BoltIcon,
  ArrowLeftStartOnRectangleIcon
} from '@heroicons/react/24/outline';
import { api, mediaUrl, clearToken } from '@/lib/api';
import { useRouter } from 'next/navigation';

const nav = [
  { href: '/agency', label: 'Dashboard', icon: Squares2X2Icon },
  { href: '/agency/packages', label: 'Packages', icon: ArchiveBoxIcon },
  { href: '/agency/bookings', label: 'Bookings', icon: CalendarDaysIcon },
  { href: '/agency/profile', label: 'Profile', icon: UserCircleIcon },
];

function cx(...cls: (string | false | undefined)[]) {
  return cls.filter(Boolean).join(' ');
}

export default function AgencyShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<any>(null);

  const fetchUserInfo = async () => {
    try {
      const data = await api.get<any>('/api/users/profile/');
      setUserInfo(data);
    } catch {
      setUserInfo(null);
    }
  };

  useEffect(() => {
    fetchUserInfo();
    window.addEventListener('profileUpdated', fetchUserInfo);
    return () => window.removeEventListener('profileUpdated', fetchUserInfo);
  }, []);

  const avatarDisplay = userInfo?.profile_picture ? mediaUrl(userInfo.profile_picture) : null;

  const handleLogout = () => {
    clearToken();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-white transition-all group-hover:bg-orange-500 group-hover:rotate-12 shadow-lg shadow-slate-200 group-hover:shadow-orange-100">
              <BoltIcon className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg text-slate-900 leading-none tracking-tight">AGENCY<span className="text-orange-500">PRO</span></span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-0.5">Control Panel</span>
            </div>
          </Link>
          <Link href="/agency/profile" className="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-all">
            <div className="flex flex-col items-end mr-2 text-right">
              <span className="text-sm font-black text-slate-900 leading-tight">
                {userInfo ? (userInfo.name || userInfo.username) : 'Loading...'}
              </span>
              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Verified Agency</span>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-400 group-hover:bg-slate-200 transition-colors overflow-hidden relative">
              {avatarDisplay ? (
                <Image src={avatarDisplay} alt="Profile" fill className="object-cover" />
              ) : (
                <UserCircleIcon className="w-7 h-7" />
              )}
            </div>
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-12 md:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="sticky top-[100px] h-max space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-4 shadow-xl shadow-slate-100">
            <nav className="space-y-2">
              {nav.map((n) => {
                const active = pathname === n.href || pathname.startsWith(n.href + '/');
                const Icon = n.icon;
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={cx(
                      'flex items-center gap-3 rounded-2xl px-4 py-3 text-[13px] font-bold transition-all uppercase tracking-widest group',
                      active
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 translate-x-2'
                        : 'hover:bg-slate-50 text-slate-500 hover:text-slate-900'
                    )}
                  >
                    <Icon className={cx("w-5 h-5", active ? "text-orange-400" : "group-hover:text-orange-500")} />
                    <span>{n.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="mt-4 pt-4 border-t border-slate-50">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full rounded-2xl px-4 py-3 text-[13px] font-bold text-rose-500 hover:bg-rose-50 transition-all uppercase tracking-widest group"
              >
                <ArrowLeftStartOnRectangleIcon className="w-5 h-5 text-rose-400 group-hover:text-rose-600" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-orange-500/20 blur-3xl" />
            <div className="relative z-10">
              <div className="text-lg font-black leading-tight">Growth <br/>Premium</div>
              <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                Scale your travel business with our advanced tools.
              </p>
              <button className="mt-6 w-full rounded-xl bg-orange-500 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all">
                Learn More
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </main>
      </div>
    </div>
  );
}
