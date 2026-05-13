'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api, mediaUrl } from '@/lib/api';

type PackageImage = { id: number; image: string };
interface TourPackage {
  id: number;
  title: string;
  location: string;
  duration_detail?: string;
  start_date?: string;
  end_date?: string;
  price: string;
  image: string | null;        
  images?: PackageImage[];     
}

function getCoverPath(pkg: TourPackage): string | null {
  return pkg.image ?? pkg.images?.[0]?.image ?? null;
}

function hoursFromDuration(detail?: string): number | null {
  if (!detail) return null;
  const s = detail.toLowerCase().trim();
  const days = s.match(/(\d+(?:\.\d+)?)\s*day/);
  if (days) return Math.round(parseFloat(days[1]) * 24);
  const range = s.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*hour/);
  if (range) return Math.round((parseFloat(range[1]) + parseFloat(range[2])) / 2);
  const hrs = s.match(/(\d+(?:\.\d+)?)\s*hour/);
  if (hrs) return Math.round(parseFloat(hrs[1]));
  return null;
}

const THEME_OPTIONS = ['Water activities', 'Adrenaline', 'Nature', 'Hidden Gem'] as const;
type Theme = typeof THEME_OPTIONS[number];

const DURATION_OPTIONS = ['0–3 hours', '3–5 hours', 'Multi-day'] as const;
type DurationBucket = typeof DURATION_OPTIONS[number];

export default function PackagesPage() {
  const [packages, setPackages] = useState<TourPackage[]>([]);
  
  const [query, setQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [themes, setThemes] = useState<Set<Theme>>(new Set());
  const [durations, setDurations] = useState<Set<DurationBucket>>(new Set());
  const [wishlistOnly, setWishlistOnly] = useState(false);

  const [wishlist, setWishlist] = useState<Set<number>>(new Set());

  useEffect(() => {
    (async () => {
       try {
         const data = await api.get<TourPackage[]>('/api/users/packages/');
         setPackages(data);
       } catch {
         setPackages([]);
       }
    })();
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('wishlist_ids');
      if (raw) setWishlist(new Set<number>(JSON.parse(raw)));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('wishlist_ids', JSON.stringify(Array.from(wishlist)));
    } catch {}
  }, [wishlist]);

  const toggleTheme = (t: Theme) =>
    setThemes((prev) => { const s = new Set(prev); s.has(t) ? s.delete(t) : s.add(t); return s; });

  const toggleDuration = (d: DurationBucket) =>
    setDurations((prev) => { const s = new Set(prev); s.has(d) ? s.delete(d) : s.add(d); return s; });

  const toggleWishlist = (id: number) =>
    setWishlist((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const filtered = useMemo(() => {
    return packages.filter((pkg) => {
      const hay = `${pkg.title} ${pkg.location}`.toLowerCase();
      const okQuery = !query || hay.includes(query.toLowerCase());

      let okDate = true;
      if (dateFrom && pkg.start_date) okDate = okDate && pkg.start_date >= dateFrom;
      if (dateTo && pkg.end_date) okDate = okDate && pkg.end_date <= dateTo;

      let okTheme = true;
      if (themes.size > 0) okTheme = Array.from(themes).some((t) => hay.includes(t.toLowerCase()));

      let okDuration = true;
      if (durations.size > 0) {
        const hrs = hoursFromDuration(pkg.duration_detail);
        okDuration = Array.from(durations).some((d) =>
          hrs != null && (
            (d === '0–3 hours' && hrs >= 0 && hrs <= 3) ||
            (d === '3–5 hours' && hrs >= 3 && hrs <= 5) ||
            (d === 'Multi-day' && hrs >= 24)
          )
        );
      }

      const okWishlist = !wishlistOnly || wishlist.has(pkg.id);
      return okQuery && okDate && okTheme && okDuration && okWishlist;
    });
  }, [packages, query, dateFrom, dateTo, themes, durations, wishlistOnly, wishlist]);

  return (
    <div className="bg-slate-50 min-h-screen pt-24">
      {/* Hero Header */}
      <div className="relative h-[400px] w-full flex items-center justify-center overflow-hidden">
        <Image
          src="/images/autumn-season-mountain-fuji-kawaguchiko-lake-japan.jpg"
          alt="Packages Hero"
          fill
          priority
          className="object-cover scale-105"
        />
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-2xl">Discover Your <span className="text-orange-400">Next Adventure</span></h1>
          <p className="text-slate-200 text-lg md:text-xl max-w-2xl mx-auto font-medium">Explore our handpicked collection of premium tour packages tailored for your dream getaway.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* Sidebar Filter */}
        <aside className="lg:col-span-1 space-y-8 h-fit sticky top-28">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              Search & Filter
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Keyword..."
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-orange-500 outline-none"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Travel Date</label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-700 outline-none focus:ring-1 focus:ring-orange-200"
                  />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-700 outline-none focus:ring-1 focus:ring-orange-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Themes</label>
                <div className="space-y-2">
                  {THEME_OPTIONS.map((theme) => (
                    <label key={theme} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                        checked={themes.has(theme)}
                        onChange={() => toggleTheme(theme)}
                      />
                      <span className="text-sm text-slate-600 group-hover:text-orange-600 transition-colors">{theme}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    id="wishlistOnly"
                    type="checkbox"
                    className="w-5 h-5 rounded border-slate-300 text-pink-500 focus:ring-pink-500"
                    checked={wishlistOnly}
                    onChange={(e) => setWishlistOnly(e.target.checked)}
                  />
                  <label htmlFor="wishlistOnly" className="text-sm font-bold text-slate-700 cursor-pointer">Wishlist Only ❤️</label>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setQuery(''); setDateFrom(''); setDateTo('');
                    setThemes(new Set()); setDurations(new Set()); setWishlistOnly(false);
                  }}
                  className="w-full py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-xs uppercase hover:bg-slate-50 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* List Content */}
        <main className="lg:col-span-3">
          <div className="flex items-center justify-between mb-8">
            <p className="text-slate-500 font-medium">Found <span className="text-slate-900 font-bold">{filtered.length}</span> packages</p>
          </div>

          <div className="space-y-8">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-slate-200">
                <p className="text-slate-400 text-lg italic">No tour packages match your criteria.</p>
              </div>
            ) : (
              filtered.map((pkg) => {
                const coverUrl = mediaUrl(getCoverPath(pkg)); 
                const wished = wishlist.has(pkg.id);

                return (
                  <div
                    key={pkg.id}
                    className="group bg-white rounded-[2rem] border border-slate-100 card-shadow overflow-hidden flex flex-col md:flex-row"
                  >
                    <div className="relative w-full md:w-80 h-64 md:h-auto overflow-hidden">
                      {coverUrl ? (
                        <Image
                          src={coverUrl}
                          alt={pkg.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width:768px) 100vw, 400px"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-slate-100 text-slate-400">
                          No Photo
                        </div>
                      )}
                      <button
                        onClick={(e) => { e.preventDefault(); toggleWishlist(pkg.id); }}
                        className={`absolute top-4 left-4 p-3 rounded-2xl backdrop-blur-md transition-all ${
                          wished ? 'bg-pink-500 text-white shadow-lg' : 'bg-white/70 text-slate-600 hover:bg-white'
                        }`}
                      >
                        <svg className={`w-5 h-5 ${wished ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                      </button>
                    </div>

                    <div className="flex-1 p-8 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                           <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest">
                             {pkg.location}
                           </span>
                           <span className="text-slate-300">•</span>
                           <span className="text-xs text-slate-500 font-medium">
                             {pkg.duration_detail || 'Standard Tour'}
                           </span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-orange-500 transition-colors">
                          {pkg.title}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium mb-6">
                           <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              {pkg.start_date ?? '-'}
                           </div>
                           <div className="flex items-center gap-1 text-slate-300">|</div>
                           <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              {pkg.location}
                           </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-50 gap-4">
                        <div className="flex flex-col items-center sm:items-start">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price starting at</span>
                           <span className="text-3xl font-black text-slate-900 leading-none">
                              {Number(pkg.price).toLocaleString()} <span className="text-lg">฿</span>
                           </span>
                        </div>
                        <Link href={`/packages/${pkg.id}`} className="w-full sm:w-auto">
                          <button className="w-full bg-slate-900 text-white hover:bg-orange-600 px-8 py-4 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-slate-200 hover:shadow-orange-100 uppercase tracking-wider">
                            View Tour Details
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
