'use client';

import Image from 'next/image';
import { 
  GlobeAsiaAustraliaIcon, 
  MapPinIcon, 
  ShieldCheckIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowRightIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

export default function AboutPage() {
  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      {/* Hero Section */}
      <section className="relative h-[500px] w-full flex items-center justify-center overflow-hidden">
        <Image
          src="/images/senbon-torii-6389421_1920.jpg" 
          alt="About Background"
          fill
          priority
          className="object-cover scale-105"
        />
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />
        <div className="relative z-10 text-center px-4">
           <span className="px-4 py-1 rounded-full bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest mb-4 inline-block">Our Story</span>
           <h1 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-2xl">About <span className="text-orange-400">Booking & Travel</span></h1>
           <p className="max-w-2xl mx-auto text-slate-200 text-lg font-medium leading-relaxed">
             We are more than just a travel agency. We are your dedicated partner in discovering 
             the most breathtaking destinations around the globe.
           </p>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 items-center gap-16">
          <div className="space-y-8">
            <div>
               <div className="flex items-center gap-2 mb-4">
                  <GlobeAsiaAustraliaIcon className="w-8 h-8 text-orange-500" />
                  <h2 className="text-3xl md:text-4xl font-black text-slate-800 leading-tight">Crafting Unforgettable <br /><span className="text-orange-500">Global Journeys</span></h2>
               </div>
               <div className="h-1.5 w-20 bg-orange-500 rounded-full"></div>
            </div>
            <p className="text-slate-600 text-lg leading-relaxed font-medium">
              Founded in 2026, our mission has always been to democratize luxury travel. 
              We believe that everyone deserves a professional, safe, and deeply enriching 
              travel experience without the stress of planning.
            </p>
            <div className="space-y-4">
               {[
                 { title: 'Exclusivity', desc: 'Handpicked destinations and private tours.', icon: MapPinIcon },
                 { title: 'Transparency', desc: 'No hidden fees, no surprises.', icon: ShieldCheckIcon },
                 { title: 'Passion', desc: 'Managed by travelers, for travelers.', icon: UserGroupIcon }
               ].map((item, i) => (
                 <div key={i} className="flex gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 transition-all group">
                    <item.icon className="w-6 h-6 text-orange-500 group-hover:scale-110 transition-transform" />
                    <div>
                       <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest">{item.title}</h4>
                       <p className="text-sm text-slate-500 mt-1 font-medium">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-100 rounded-full -z-0 opacity-50 blur-3xl"></div>
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white">
              <Image
                src="/images/senbon-torii-6389421_1920.jpg" 
                alt="About Travel"
                width={800}
                height={1000}
                className="w-full object-cover aspect-[4/5]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
           <div className="text-center mb-16">
              <p className="text-orange-500 font-black text-[10px] uppercase tracking-[0.3em] mb-4">Core Values</p>
              <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">Why Travel With Us?</h2>
              <p className="text-slate-400 max-w-xl mx-auto font-medium">We combine local expertise with global standards to provide you the best travel experience.</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { title: 'Professional Guides', desc: 'Certified local experts who speak your language and know every secret spot.', icon: GlobeAsiaAustraliaIcon },
                { title: 'Ultimate Safety', desc: '24/7 support and comprehensive insurance for your peace of mind.', icon: ShieldCheckIcon },
                { title: 'Curated Pricing', desc: 'Best value for your money with direct partnerships around the world.', icon: CurrencyDollarIcon }
              ].map((val, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] hover:bg-white/10 transition-all text-center group">
                   <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-500 transition-all">
                      <val.icon className="w-8 h-8 text-orange-500 group-hover:text-white transition-all" />
                   </div>
                   <h3 className="text-xl font-black mb-4 uppercase tracking-widest text-sm">{val.title}</h3>
                   <p className="text-slate-400 leading-relaxed text-sm font-medium">{val.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* News Preview */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
           <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                 <h2 className="text-3xl font-black text-slate-800 tracking-tight">Latest Travel News</h2>
                 <p className="text-slate-500 mt-2 font-medium">Get inspired by our latest updates and travel tips.</p>
              </div>
              <button className="px-6 py-3 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">View All News</button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[
               { title: 'Beautiful Beach to Visit', date: 'July 2026' },
               { title: 'Colorful Tourist Houses', date: 'July 2026' },
               { title: 'Top 5 Travel Destinations', date: 'July 2026' }
             ].map((news, i) => (
               <div key={i} className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100">
                 <div className="relative h-56 overflow-hidden">
                    <Image
                      src="/images/senbon-torii-6389421_1920.jpg"
                      alt={news.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                 </div>
                 <div className="p-8">
                    <span className="flex items-center gap-2 text-[10px] font-black text-orange-500 uppercase tracking-widest mb-3">
                       <CalendarDaysIcon className="w-3 h-3" />
                       {news.date}
                    </span>
                    <h4 className="text-lg font-black text-slate-800 group-hover:text-orange-500 transition-colors leading-tight">{news.title}</h4>
                    <p className="text-slate-500 text-sm mt-4 leading-relaxed font-medium">Discover why this destination is becoming the hottest spot for travelers this year...</p>
                    <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-widest group-hover:gap-4 transition-all">
                       Read More <ArrowRightIcon className="w-3 h-3 text-orange-500" />
                    </div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </section>
    </div>
  );
}
