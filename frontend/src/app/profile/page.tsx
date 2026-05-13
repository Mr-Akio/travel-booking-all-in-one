'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { 
  UserIcon, 
  CalendarDaysIcon, 
  PhoneIcon, 
  IdentificationIcon, 
  GlobeAsiaAustraliaIcon, 
  MapPinIcon, 
  EnvelopeIcon,
  CameraIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { toast, Toaster } from 'react-hot-toast';
import { api, mediaUrl } from '@/lib/api';

// ====== Upload rules ======
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_MB = 3;

export default function UserProfile() {
  const [form, setForm] = useState({
    name: '',
    dob: '',
    gender: '',
    phone: '',
    passport_no: '',
    nationality: '',
    address: '',
    email: '',
    profile_picture: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrl = useMemo(() => (avatarFile ? URL.createObjectURL(avatarFile) : ''), [avatarFile]);

  // ----- GET profile -----
  const fetchProfileData = useCallback(async () => {
    try {
      const data = await api.get<any>('/api/users/profile/');
      setForm({
        name: data?.username || '',
        dob: data?.birth_date || '',
        gender: data?.gender || '',
        phone: data?.phone || '',
        passport_no: data?.passport_no || '',
        nationality: data?.nationality || '',
        address: data?.address || '',
        email: data?.email || '',
        profile_picture: data?.profile_picture || '',
      });
    } catch {
      toast.error('Failed to load profile.');
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onClickChangeAvatar = () => fileInputRef.current?.click();

  const handleAvatarSelect = (file: File | null) => {
    if (!file) return setAvatarFile(null);
    if (!ALLOWED_MIME.includes(file.type)) {
      toast.error('Allowed file types: JPG, PNG, WEBP');
      return setAvatarFile(null);
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`Max file size: ${MAX_FILE_MB} MB`);
      return setAvatarFile(null);
    }
    setAvatarFile(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const fd = new FormData();
      if (form.name) fd.append('name', form.name);
      if (form.dob) fd.append('dob', form.dob); 
      if (form.gender) fd.append('gender', form.gender);
      if (form.phone) fd.append('phone', form.phone);
      if (form.passport_no) fd.append('passport_no', form.passport_no);
      if (form.nationality) fd.append('nationality', form.nationality);
      if (form.address) fd.append('address', form.address);
      if (avatarFile) fd.append('profile_picture', avatarFile);

      await api.put('/api/users/profile/update/', fd);
      toast.success('Profile updated successfully!');
      setAvatarFile(null);
      fetchProfileData();

      // Notify Navbar to update profile picture
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err: any) {
      toast.error(err.message || 'Error while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <ArrowPathIcon className="w-12 h-12 text-orange-500 animate-spin mb-4" />
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.25em]">Loading Profile...</p>
    </div>
  );

  const avatarDisplay = previewUrl || mediaUrl(form.profile_picture) || '/images/profile.jpg';

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 font-sans text-slate-900">
      <Toaster position="top-center" />
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="mb-10 flex items-center justify-between">
           <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Account <span className="text-orange-500">Settings</span></h1>
              <p className="text-slate-500 font-medium mt-2 uppercase tracking-widest text-[10px]">Manage your personal information and security</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* Sidebar / Profile Card */}
          <aside className="lg:col-span-1 space-y-6">
             <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-8 border border-slate-100 flex flex-col items-center text-center">
                <div className="relative group mb-6">
                   <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-slate-50 shadow-2xl relative group-hover:scale-105 transition-transform duration-500">
                      <Image src={avatarDisplay} alt="Profile" fill className="object-cover" />
                   </div>
                   <button 
                     onClick={onClickChangeAvatar}
                     className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-orange-500 transition-all shadow-xl active:scale-95"
                   >
                      <CameraIcon className="w-5 h-5" />
                   </button>
                </div>
                
                <h2 className="text-xl font-black text-slate-900 tracking-tight">{form.name || 'User Name'}</h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">{form.email}</p>
                
                <div className="w-full mt-8 pt-8 border-t border-slate-50 space-y-4">
                   <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Birthday</span>
                      <span className="text-slate-900">{form.dob || 'Not set'}</span>
                   </div>
                   <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Status</span>
                      <span className="text-emerald-500">Active</span>
                   </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_MIME.join(',')}
                  className="hidden"
                  onChange={(e) => handleAvatarSelect(e.target.files?.[0] || null)}
                />
             </div>
             
             <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-200/50 relative overflow-hidden">
                <ShieldCheckIcon className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5" />
                <h4 className="text-sm font-black uppercase tracking-widest mb-4">Pro Tip</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">Keep your passport number up to date for faster booking confirmation.</p>
             </div>
          </aside>

          {/* Main Form Area */}
          <div className="lg:col-span-3 space-y-10">
             
             {/* Personal Information Card */}
             <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-8 md:p-12 border border-slate-100">
                <div className="flex items-center gap-3 mb-10 border-b border-slate-50 pb-6">
                   <UserIcon className="w-6 h-6 text-orange-500" />
                   <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Personal Information</h3>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                       <input
                         name="name"
                         value={form.name}
                         onChange={handleChange}
                         placeholder="e.g. Jane Doe"
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-inner"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                       <input
                         type="date"
                         name="dob"
                         value={form.dob}
                         onChange={handleChange}
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-inner"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                       <select
                         name="gender"
                         value={form.gender}
                         onChange={handleChange}
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 transition-all appearance-none cursor-pointer"
                       >
                         <option value="">— Select gender —</option>
                         <option value="male">Male</option>
                         <option value="female">Female</option>
                         <option value="other">Other</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                       <input
                         name="phone"
                         value={form.phone}
                         onChange={handleChange}
                         placeholder="e.g. +66 8x xxxx xxx"
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-inner"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Passport / ID No.</label>
                       <input
                         name="passport_no"
                         value={form.passport_no}
                         onChange={handleChange}
                         placeholder="e.g. AA1234567"
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-inner"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nationality</label>
                       <select
                         name="nationality"
                         value={form.nationality}
                         onChange={handleChange}
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 transition-all appearance-none cursor-pointer"
                       >
                         <option value="">— Select nationality —</option>
                         {['Thai', 'Japanese', 'Korean', 'Chinese', 'American', 'British', 'Australian', 'Other'].map(n => (
                           <option key={n} value={n}>{n}</option>
                         ))}
                       </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Address</label>
                     <textarea
                       name="address"
                       rows={3}
                       value={form.address}
                       onChange={handleChange}
                       placeholder="House No., Street, City, Country"
                       className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-inner resize-none"
                     />
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="group w-full md:w-auto bg-slate-900 text-white py-4 px-12 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-orange-500 shadow-xl shadow-slate-200 hover:shadow-orange-200 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {saving ? 'Updating...' : (
                        <>
                           Save Profile
                           <CheckCircleIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
             </div>

             {/* Security Card */}
             <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-8 md:p-12 border border-slate-100">
                <div className="flex items-center gap-3 mb-10 border-b border-slate-50 pb-6">
                   <ShieldCheckIcon className="w-6 h-6 text-orange-500" />
                   <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Security Settings</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                  <div className="md:col-span-2 space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                     <input
                       name="email"
                       type="email"
                       readOnly
                       value={form.email}
                       className="w-full bg-slate-100 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-400 outline-none cursor-not-allowed"
                     />
                  </div>
                  <button type="button" className="bg-slate-50 text-slate-400 border border-slate-200 py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all cursor-not-allowed">
                    Update Email
                  </button>
                </div>
                <p className="text-[9px] text-slate-400 font-bold ml-1 mt-3 uppercase tracking-wider">Email cannot be changed directly for security reasons.</p>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
}
