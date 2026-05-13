'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  FaCheckCircle,
  FaClock,
  FaHeart,
  FaShareAlt,
} from 'react-icons/fa';
import { useCurrency } from '@/providers/CurrencyProvider';
import { api, mediaUrl } from '@/lib/api';

type ImageType = { id: number; image: string };

interface TourPackage {
  id: number;
  title: string;
  description: string;
  price: string;              
  location: string;
  start_date: string;
  end_date: string;
  image: string | null;       
  slots: number;
  images: ImageType[];
  activities?: string;
  includes?: string;
  excludes?: string;
  duration_detail?: string;
  group_size?: string;
  languages?: string;
  meeting_point?: string;

  agency_name?: string;
  owner_username?: string;

  map_image?: string | null;
  map_url?: string | null;
}

// ---------- Helpers ----------
function pickCoverPath(pkg: TourPackage): string | null {
  return pkg.image ?? pkg.images?.[0]?.image ?? null;
}

// ---------- Wishlist helpers (localStorage) ----------
function readWishlist(): number[] {
  try {
    const raw = localStorage.getItem('wishlist') || '[]';
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function writeWishlist(ids: number[]) {
  localStorage.setItem('wishlist', JSON.stringify(Array.from(new Set(ids))));
}

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const pkgId = id ? Number(id) : undefined;

  const [tour, setTour] = useState<TourPackage | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [people, setPeople] = useState(1);
  const [message, setMessage] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { format } = useCurrency();

  useEffect(() => {
    if (!pkgId) return;
    const list = readWishlist();
    setIsWishlisted(list.includes(pkgId));
  }, [pkgId]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await api.get<TourPackage>(`/api/users/packages/${id}/`);
        setTour(data);
        setSelectedPath(pickCoverPath(data));
      } catch {
        setMessage('❌ Failed to fetch package');
      }
    })();
  }, [id]);

  const heroUrl = useMemo(() => mediaUrl(tour ? pickCoverPath(tour) : null), [tour]);
  const galleryUrl = mediaUrl(selectedPath);

  const thumbs: string[] = useMemo(() => {
    if (!tour) return [];
    return [tour.image || '', ...(tour.images || []).map((i) => i.image || '')]
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i);
  }, [tour]);

  const outOfSeats = useMemo(() => {
    if (!tour) return false;
    return people > tour.slots || tour.slots <= 0;
  }, [people, tour]);

  const handleBooking = async () => {
    if (!tour) return;
    const token = localStorage.getItem('access');
    if (!token) {
      setMessage('❌ Please log in before booking');
      return;
    }
    if (outOfSeats) {
      setMessage('❌ Not enough seats available');
      return;
    }

    try {
      const data = await api.post<any>(`/api/users/bookings/create/`, {
        package_id: tour.id,
        travel_date: tour.start_date,
        number_of_people: people,
      });

      setTour((prev) => (prev ? { ...prev, slots: prev.slots - people } : prev));
      router.push(`/booking/confirm?booking_id=${data.id}`);
    } catch (err: any) {
      setMessage(`❌ ${err.message || 'Booking failed'}`);
    }
  };

  const toggleWishlist = () => {
    if (!pkgId) return;
    const list = readWishlist();
    const exists = list.includes(pkgId);
    const next = exists ? list.filter((x) => x !== pkgId) : [...list, pkgId];
    writeWishlist(next);
    setIsWishlisted(!exists);
    setMessage(exists ? '💔 Removed from wishlist' : '❤️ Added to wishlist');
    setTimeout(() => setMessage(''), 1200);
  };

  if (!tour) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const agencyLabel = tour.agency_name ?? tour.owner_username ?? '—';
  const mapImageUrl = mediaUrl(tour.map_image);

  return (
    <div className="min-h-screen bg-slate-50 pt-24">
      {/* Simple Hero Section */}
      <div className="relative w-full h-[450px]">
        {heroUrl ? (
          <Image src={heroUrl} alt={tour.title} fill className="object-cover" priority sizes="100vw" />
        ) : (
          <div className="grid h-full w-full place-items-center bg-slate-200">No Image</div>
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-10 left-0 w-full">
           <div className="max-w-7xl mx-auto px-6">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{tour.title}</h1>
              <p className="text-gray-200">By {agencyLabel} • {tour.location}</p>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
            {/* Gallery */}
            <div className="mb-8">
              <div className="relative w-full h-[400px] rounded-xl overflow-hidden">
                {galleryUrl ? (
                  <Image src={galleryUrl} alt={tour.title} fill className="object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-slate-50">No Photo</div>
                )}
              </div>
              {thumbs.length > 1 && (
                <div className="flex mt-4 gap-3 overflow-x-auto pb-2">
                  {thumbs.map((img, i) => {
                    const thumbUrl = mediaUrl(img);
                    return thumbUrl ? (
                      <div 
                        key={i}
                        className={`relative h-20 w-28 shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer ${
                          selectedPath === img ? 'border-orange-500' : 'border-transparent'
                        }`}
                        onClick={() => setSelectedPath(img)}
                      >
                        <Image src={thumbUrl} alt="Thumb" fill className="object-cover" />
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-slate-100 mb-8">
               <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Duration</p>
                  <p className="text-sm font-bold text-gray-800">{tour.duration_detail || 'N/A'}</p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Group Size</p>
                  <p className="text-sm font-bold text-gray-800">{tour.group_size || 'Flexible'}</p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Languages</p>
                  <p className="text-sm font-bold text-gray-800">{tour.languages || 'English'}</p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Seats</p>
                  <p className="text-sm font-bold text-gray-800">{tour.slots} Left</p>
               </div>
            </div>

            <section className="mb-8">
               <h3 className="text-xl font-bold text-gray-800 mb-4">The Experience</h3>
               <p className="text-gray-600 leading-relaxed whitespace-pre-line">{tour.description}</p>
            </section>

            <div className="grid md:grid-cols-2 gap-6">
               <section className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
                  <h4 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
                     <FaCheckCircle className="text-emerald-500" /> What&apos;s Included
                  </h4>
                  <p className="text-emerald-900/70 text-xs leading-relaxed whitespace-pre-line">{tour.includes || 'Standard'}</p>
               </section>
               <section className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <h4 className="text-sm font-bold text-gray-800 mb-3">Not Included</h4>
                  <p className="text-gray-500 text-xs leading-relaxed whitespace-pre-line">{tour.excludes || 'N/A'}</p>
               </section>
            </div>
          </div>
        </div>

        {/* Right: Simple Minimal Sidebar */}
        <div className="lg:col-span-1">
           <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 sticky top-28">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Booking Details</h3>
              
              <div className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Schedule</label>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-gray-800 font-semibold text-sm">
                       {tour.start_date} – {tour.end_date}
                    </div>
                 </div>

                 <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Travelers</label>
                    <div className="flex items-center gap-4 border border-slate-200 rounded-xl p-1">
                       <button 
                         onClick={() => setPeople(Math.max(1, people - 1))}
                         className="h-10 w-10 rounded-lg bg-slate-50 text-gray-600 font-bold hover:bg-slate-100"
                       >-</button>
                       <div className="flex-1 text-center font-bold text-gray-800">{people}</div>
                       <button 
                         onClick={() => setPeople(people + 1)}
                         className="h-10 w-10 rounded-lg bg-slate-50 text-gray-600 font-bold hover:bg-slate-100"
                       >+</button>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-slate-100 flex items-end justify-between">
                    <div>
                       <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total Price</p>
                       <p className="text-2xl font-bold text-orange-500">
                          {format(Number(tour.price || 0) * people)}
                       </p>
                    </div>
                 </div>

                 <button
                   onClick={handleBooking}
                   disabled={outOfSeats}
                   className={`w-full py-4 rounded-xl font-bold text-sm transition-all ${
                     outOfSeats 
                       ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                       : 'bg-orange-500 text-white hover:bg-orange-600'
                   }`}
                 >
                   {outOfSeats ? 'Fully Booked' : 'Book Now'}
                 </button>

                 {message && (
                   <p className={`text-xs text-center font-bold p-3 rounded-lg ${message.startsWith('✅') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {message}
                   </p>
                 )}

                 <div className="grid grid-cols-2 gap-3 mt-4">
                    <button
                      onClick={toggleWishlist}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold border transition-all ${
                        isWishlisted ? 'bg-pink-50 border-pink-200 text-pink-600' : 'border-slate-200 text-gray-400 hover:border-gray-400'
                      }`}
                    >
                      <FaHeart /> {isWishlisted ? 'Saved' : 'Save'}
                    </button>
                    <button className="flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold border border-slate-200 text-gray-400 hover:border-gray-400 transition-all">
                       <FaShareAlt /> Share
                    </button>
                 </div>
              </div>

              {/* Map */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                 <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-4">Location Map</h4>
                 <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                    {mapImageUrl ? (
                      <Image src={mapImageUrl} alt="Map" fill className="object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-[10px] text-gray-300">Map Preview Unavailable</div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
