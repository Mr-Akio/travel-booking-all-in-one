'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCurrency } from '@/providers/CurrencyProvider';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  ChevronRightIcon, 
  ArrowRightIcon 
} from '@heroicons/react/24/outline';
import { api, mediaUrl } from '@/lib/api';

// -------- Types --------
type PackageImage = { id: number; image: string };
type TourPackage = {
  id: number;
  title: string;
  description: string;
  price: string;                 
  location: string;
  image: string | null;         
  images?: PackageImage[];      
};

export default function HomePage() {
  const [packages, setPackages] = useState<TourPackage[] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { format } = useCurrency();

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<TourPackage[]>('/api/users/packages/');
        setPackages(data);
      } catch (err) {
        console.error('❌ Failed to load packages', err);
        setPackages([]);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const list = packages ?? [];
    const q = searchTerm.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
    );
  }, [packages, searchTerm]);

  // Limit to 2 rows (8 items)
  const displayPackages = useMemo(() => filtered.slice(0, 8), [filtered]);

  function getCoverPath(pkg: TourPackage): string | null {
    return pkg.image ?? pkg.images?.[0]?.image ?? null;
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section (Original Design) */}
      <section
        className="relative h-[550px] bg-cover bg-center"
        style={{ backgroundImage: "url('/images/pexels-fabianwiktor-994605.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-6 text-4xl md:text-6xl font-bold leading-tight text-white drop-shadow-md">
            Let&apos;s make your dream trip come true
            <br /> wherever you want to go.
          </h1>
          
          <div className="flex flex-wrap justify-center gap-2 bg-white/10 p-2 rounded-2xl backdrop-blur-sm border border-white/20">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Where to?"
                className="rounded-xl bg-white pl-12 pr-6 py-4 text-lg text-black focus:outline-none w-full md:w-80 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="rounded-xl bg-white px-6 py-4 text-lg text-black focus:outline-none shadow-sm cursor-pointer appearance-none">
              <option>Travel Type</option>
              <option>Adventure</option>
              <option>Relaxing</option>
            </select>
            <button className="rounded-xl bg-orange-500 px-10 py-4 text-lg font-bold text-white hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-200">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Packages Section (Original Design with Limit) */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 flex justify-between items-end">
           <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
                <span className="text-orange-500">Today</span> Recommended for you
                <br /> Tour Packages
              </h2>
              <div className="h-1.5 w-20 bg-orange-500 mt-4 rounded-full"></div>
           </div>
           <Link href="/packagesList" className="text-orange-500 font-bold hover:underline hidden md:block">
              View all packages →
           </Link>
        </div>

        {!packages ? (
          <p className="text-center text-slate-500 py-20">Loading packages...</p>
        ) : displayPackages.length === 0 ? (
          <p className="text-center text-slate-400 py-20 italic">No tour packages found</p>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
              {displayPackages.map((pkg) => {
                const priceTHB = Number(pkg.price) || 0;
                const coverUrl = mediaUrl(getCoverPath(pkg));

                return (
                  <div
                    key={pkg.id}
                    className="group card-shadow overflow-hidden rounded-2xl border border-slate-100 bg-white hover:shadow-lg transition-all"
                  >
                    <div className="relative h-56 w-full overflow-hidden">
                      {coverUrl ? (
                        <Image
                          src={coverUrl}
                          alt={pkg.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-slate-50 text-slate-400">
                          No Image Available
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="mb-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold mb-2 uppercase tracking-wide">
                          <MapPinIcon className="w-3 h-3" />
                          {pkg.location}
                        </span>
                        <h3 className="text-lg font-bold leading-snug text-slate-800 line-clamp-2">
                          {pkg.title}
                        </h3>
                      </div>

                      <p className="text-sm text-slate-500 line-clamp-2 mb-6 leading-relaxed">
                        {pkg.description}
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        <p className="text-2xl font-black text-slate-900">
                          {format(priceTHB)}
                        </p>
                        
                        <Link href={`/packages/${pkg.id}`}>
                          <button className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600 transition-colors">
                            Details
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View More Button */}
            <div className="flex justify-center mt-12">
               <Link href="/packagesList" className="inline-flex items-center gap-2 bg-white border-2 border-orange-500 text-orange-500 px-8 py-3 rounded-xl font-bold hover:bg-orange-500 hover:text-white transition-all">
                  View More Packages
                  <ArrowRightIcon className="w-5 h-5" />
               </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
