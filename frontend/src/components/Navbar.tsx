import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import { GlobeAsiaAustraliaIcon } from '@heroicons/react/24/outline';
import { api, mediaUrl } from '@/lib/api';
import { useCurrency } from '@/providers/CurrencyProvider';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({ username: '', email: '', profile_picture: '' });
  const { currency, setCurrency } = useCurrency();

  const fetchUserInfo = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null;
    setIsLoggedIn(!!token);

    if (token) {
      api.get<{ username: string; email: string; profile_picture: string }>('/api/users/profile/')
        .then((data) => setUserInfo({ 
          username: data.username || '', 
          email: data.email || '',
          profile_picture: data.profile_picture || ''
        }))
        .catch(() => {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          setIsLoggedIn(false);
        });
    }
  }, []);

  useEffect(() => {
    fetchUserInfo();
    window.addEventListener('profileUpdated', fetchUserInfo);
    return () => window.removeEventListener('profileUpdated', fetchUserInfo);
  }, [fetchUserInfo]);

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Packages', href: '/packagesList' },
    { label: 'Blog', href: '/blog' },
    { label: 'About', href: '/about' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] bg-white shadow-sm border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <GlobeAsiaAustraliaIcon className="w-8 h-8 text-orange-500 group-hover:rotate-12 transition-transform duration-500" />
          <span className="text-xl md:text-2xl font-black tracking-tight text-slate-800">
            Booking <span className="text-orange-500">&</span> Travel
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link 
                href={item.href}
                className="text-sm font-semibold text-slate-600 hover:text-orange-500 transition-colors uppercase tracking-wide"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-6">
          {/* Currency Switcher - Hidden on small mobile */}
          <div className="hidden sm:flex items-center border border-slate-200 rounded-lg overflow-hidden">
            {['THB', 'USD'].map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrency(curr as 'THB' | 'USD')}
                className={`px-3 py-1 text-[10px] md:text-xs font-bold transition-all ${
                  currency === curr ? 'bg-slate-800 text-white' : 'bg-white text-slate-400 hover:text-slate-600'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>

          {isLoggedIn ? (
            <div className="relative">
              <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="flex items-center gap-2 md:gap-3 text-slate-700 hover:text-orange-500 transition-colors group"
              >
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl overflow-hidden border-2 border-slate-50 shadow-sm group-hover:border-orange-200 transition-all relative bg-slate-100">
                   {userInfo.profile_picture ? (
                     <Image 
                       src={mediaUrl(userInfo.profile_picture)} 
                       alt={userInfo.username} 
                       fill 
                       className="object-cover"
                     />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-slate-300">
                       <FaUserCircle className="w-full h-full" />
                     </div>
                   )}
                </div>
                <span className="text-sm font-bold hidden lg:block">{userInfo.username}</span>
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-4 w-64 bg-white rounded-[1.5rem] shadow-2xl shadow-slate-200 border border-slate-100 py-3 z-[110] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-5 py-3 border-b border-slate-50 mb-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signed in as</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{userInfo.email}</p>
                  </div>
                  <ul className="space-y-1 px-2">
                    <li><Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-orange-500 rounded-xl transition-all">My Profile</Link></li>
                    <li><Link href="/booking/my" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-orange-500 rounded-xl transition-all">My Bookings</Link></li>
                    <li className="pt-1 border-t border-slate-50 mt-1"><button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all">Sign out</button></li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-orange-500 hover:bg-orange-600 px-4 md:px-8 py-2 md:py-2.5 rounded-lg font-bold text-white text-xs md:text-sm shadow-md transition-all active:scale-95"
            >
              Sign in
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-600 hover:text-orange-500 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar/Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-50 px-4 py-6 space-y-4 animate-in slide-in-from-top duration-300">
          <ul className="space-y-4">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link 
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-lg font-black text-slate-800 hover:text-orange-500 uppercase tracking-widest"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
             <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Currency</span>
             <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                {['THB', 'USD'].map((curr) => (
                  <button
                    key={curr}
                    onClick={() => { setCurrency(curr as 'THB' | 'USD'); setIsMobileMenuOpen(false); }}
                    className={`px-4 py-2 text-xs font-bold ${currency === curr ? 'bg-slate-800 text-white' : 'bg-white text-slate-400'}`}
                  >
                    {curr}
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}
    </nav>
  );
}
