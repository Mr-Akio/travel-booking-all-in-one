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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
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

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    const element = document.getElementById('tour-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <h1 className="mb-8 text-3xl sm:text-4xl md:text-6xl font-black leading-tight text-white drop-shadow-lg tracking-tight">
            Let&apos;s make your <span className="text-orange-400">dream trip</span>
            <br className="hidden md:block" /> come true wherever you want.
          </h1>
          
          <div className="flex flex-col md:flex-row justify-center gap-3 bg-white/10 p-3 md:p-2 rounded-3xl backdrop-blur-md border border-white/20 w-full max-w-2xl">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Where to?"
                className="rounded-2xl bg-white pl-12 pr-6 py-4 text-base md:text-lg text-black focus:outline-none w-full shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="rounded-2xl bg-white px-6 py-4 text-base md:text-lg text-black focus:outline-none shadow-sm cursor-pointer appearance-none">
              <option>Travel Type</option>
              <option>Adventure</option>
              <option>Relaxing</option>
            </select>
            <button className="rounded-2xl bg-orange-500 px-10 py-4 text-base md:text-lg font-black text-white hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Packages Section (Original Design with Limit) */}
      <section id="tour-section" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 flex justify-between items-end">
           <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
                <span className="text-orange-500">Today</span> Recommended for you
                <br /> Tour Packages
              </h2>
              <div className="h-1.5 w-20 bg-orange-500 mt-4 rounded-full"></div>
           </div>
           <Link href="/packagesList" className="text-orange-500 font-bold hover:underline hidden md:block">
              Explore all destinations →
           </Link>
        </div>

        {!packages ? (
          <p className="text-center text-slate-500 py-20">Loading packages...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-slate-400 py-20 italic">No tour packages found</p>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
              {currentItems.map((pkg) => {
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

            {/* Pagination Buttons */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-4 mt-16 border-t border-slate-100 pt-10">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-200 disabled:opacity-30 disabled:hover:bg-orange-500 active:scale-95"
                >
                  <span className="text-lg">‹</span> Previous
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 bg-orange-500 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-200 disabled:opacity-30 disabled:hover:bg-orange-500 active:scale-95"
                >
                  Next <span className="text-lg">›</span>
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
