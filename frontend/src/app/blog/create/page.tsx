'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { 
  InformationCircleIcon, 
  PhotoIcon, 
  PlusIcon, 
  XMarkIcon,
  ArrowLeftIcon,
  PaperAirplaneIcon,
  DocumentPlusIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function BlogCreatePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('is_published', String(isPublished));
    if (image) formData.append('image', image);

    try {
      const res: any = await api.post('/api/users/blog/posts/', formData);
      
      if (isPublished) {
        toast.success('Blog post published successfully!', {
          icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
        });
      } else {
        toast.success('Saved as draft!', {
          icon: <DocumentPlusIcon className="w-6 h-6 text-blue-500" />,
        });
      }
      
      setTimeout(() => {
        if (isPublished && res && res.slug) {
          router.push(`/blog/${res.slug}`);
        } else {
          router.push('/blog');
        }
      }, 1000);
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while posting');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 md:pt-32 pb-20 px-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div className="space-y-2">
             <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
               Create <span className="text-orange-500">Article</span>
             </h1>
             <p className="text-sm md:text-base text-slate-500 font-medium">Write and share your travel experiences with the community.</p>
           </div>
           <button 
             onClick={() => router.back()}
             className="w-fit flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 transition-colors group bg-white px-4 py-2 rounded-xl border border-slate-100 md:bg-transparent md:p-0 md:border-none"
           >
              <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to List
           </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
          {/* Main Content Section */}
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 p-6 md:p-12 space-y-8 mx-1 md:mx-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-50 pb-6 gap-4">
               <div className="flex items-center gap-3">
                  <InformationCircleIcon className="w-6 h-6 text-orange-500" />
                  <h2 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-widest">General Information</h2>
               </div>
               <div className="flex items-center justify-between sm:justify-end gap-4 bg-slate-50 p-3 rounded-2xl sm:bg-transparent sm:p-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Publish Status</span>
                  <button
                    type="button"
                    onClick={() => setIsPublished((v) => !v)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all shadow-inner ${
                      isPublished ? 'bg-orange-500' : 'bg-slate-200'
                    }`}
                  >
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-all shadow-md ${
                        isPublished ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
               </div>
            </div>

            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Article Title</label>
                  <input 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g. Exploring the Hidden Gems of Bangkok" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm" 
                    required 
                  />
               </div>
               
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Content / Body</label>
                  <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Describe your amazing journey..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm min-h-[300px]" 
                    required 
                  />
               </div>
            </div>
          </div>

          {/* Media Section */}
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 p-6 md:p-12 space-y-8 mx-1 md:mx-0">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
               <PhotoIcon className="w-6 h-6 text-orange-500" />
               <h2 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-widest">Cover Media</h2>
            </div>
            
            <div className="space-y-6">
              {!imagePreview ? (
                <label className="flex flex-col items-center justify-center w-full h-48 md:h-64 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-orange-500/30 transition-all group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-400">
                    <PlusIcon className="w-8 h-8 md:w-10 md:h-10 mb-2 group-hover:scale-110 transition-transform group-hover:text-orange-500" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Click to upload cover image</p>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              ) : (
                <div className="relative rounded-[2rem] overflow-hidden border-4 md:border-8 border-slate-50 shadow-inner group">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={1200}
                    height={630}
                    className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <button
                    type="button"
                    onClick={() => { setImage(null); setImagePreview(null); }}
                    className="absolute top-4 right-4 bg-white text-rose-500 w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shadow-2xl hover:bg-rose-500 hover:text-white transition-all transform hover:rotate-90"
                  >
                    <XMarkIcon className="w-6 h-6 md:w-7 md:h-7" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-4 pb-12">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-12 py-6 bg-slate-900 text-white font-black text-sm uppercase tracking-[0.3em] rounded-[2rem] hover:bg-orange-500 transition-all shadow-2xl shadow-slate-200 hover:shadow-orange-100 disabled:opacity-50 flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <PaperAirplaneIcon className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              )}
              {loading ? 'Processing...' : 'Publish Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}