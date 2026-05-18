'use client';

import { FaFacebook, FaTwitter, FaYoutube, FaVimeo } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white pt-20 pb-10">
      <div className="container mx-auto px-6">
        {/* Newsletter Section */}
        <div className="bg-slate-800 rounded-3xl p-8 md:p-12 mb-16 flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-700">
          <div className="max-w-md">
            <h4 className="text-2xl font-bold text-white mb-2 italic">Keep in Touch</h4>
            <p className="text-slate-400">Subscribe to get special offers and once-in-a-lifetime deals.</p>
          </div>
          <div className="flex w-full max-w-md gap-0 min-w-0">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 w-full min-w-0 bg-white rounded-l-xl px-4 md:px-6 py-3.5 md:py-4 text-sm md:text-base text-slate-900 outline-none"
            />
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-r-xl px-5 md:px-8 py-3.5 md:py-4 text-sm md:text-base transition-colors shrink-0">
              Send
            </button>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 bg-white rounded-3xl p-10 md:p-12">
          {/* Logo & About */}
          <div className="flex flex-col">
            <h4 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <span className="text-3xl">🌊</span> Travel
            </h4>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur ut diam et nibh condimentum venenatis.
            </p>
            <div className="flex gap-4">
              {[FaTwitter, FaFacebook, FaYoutube, FaVimeo].map((Icon, i) => (
                <a key={i} href="#" className="h-10 w-10 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-orange-500 hover:text-white transition-all">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Groups */}
          {[
            {
              title: 'Our Agency',
              links: ['Services', 'Insurance', 'Agency', 'Tourism', 'Payment']
            },
            {
              title: 'Partners',
              links: ['Booking', 'RentalCar', 'HostelWorld', 'Trivago', 'TripAdvisor']
            },
            {
              title: 'Last Minute',
              links: ['London', 'California', 'Indonesia', 'Europe', 'Oceania']
            }
          ].map((group) => (
            <div key={group.title}>
              <h4 className="text-lg font-extrabold text-slate-800 mb-6">{group.title}</h4>
              <ul className="space-y-4">
                {group.links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-slate-500 hover:text-orange-500 transition-colors font-medium">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="text-center pt-8 border-t border-slate-800">
          <p className="text-sm text-slate-500 mb-1 font-bold">The Best Travel</p>
          <p className="text-xs text-slate-600">
            Copyright © Themes 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
