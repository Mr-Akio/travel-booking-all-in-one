'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { API_BASE, api } from '@/lib/api';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  image: string | null;
  author_name: string;
  created_at: string;
  slug: string;
}

export default function BlogDetailPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    api.get<BlogPost>(`/api/users/blog/posts/${slug}/`)
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch(() => {
        setError('The article you are looking for was not found.');
        setLoading(false);
      });
  }, [slug]);

  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading story...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 p-10 rounded-[2.5rem] text-center">
             <p className="text-red-600 font-bold mb-4">{error}</p>
             <button onClick={() => router.push('/blog')} className="text-sm font-bold text-slate-800 uppercase tracking-widest hover:text-orange-500 underline">Back to Blog</button>
          </div>
        ) : post ? (
          <article className="animate-in fade-in duration-700">
            {/* Header */}
            <div className="mb-12 text-center">
              <button 
                onClick={() => router.push('/blog')}
                className="mb-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-orange-500 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <span className="text-lg">←</span> Back to all stories
              </button>
              
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                {post.title}
              </h1>
              
              <div className="flex items-center justify-center gap-4 text-sm font-bold text-slate-400 uppercase tracking-widest">
                <span className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs text-orange-600">
                      {post.author_name.charAt(0).toUpperCase()}
                   </div>
                   {post.author_name}
                </span>
                <span className="text-slate-200">|</span>
                <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>

            {/* Featured Image */}
            {post.image && (
              <div className="relative h-[400px] md:h-[550px] w-full rounded-[3rem] overflow-hidden shadow-2xl mb-16 border-8 border-white">
                <Image
                  src={post.image.startsWith('http') ? post.image : `${API_BASE}${post.image}`}
                  alt={post.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}

            {/* Content */}
            <div className="bg-white rounded-[3rem] p-8 md:p-16 card-shadow border border-slate-100">
              <div className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed space-y-6">
                {post.content.split('\n').map((para, index) => para.trim() && (
                  <p key={index} className="text-lg md:text-xl font-medium text-slate-600 leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
              
              <div className="mt-16 pt-10 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="flex items-center gap-4">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Share this story:</span>
                    <div className="flex gap-2">
                       {['fb', 'tw', 'ln'].map(s => (
                         <div key={s} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-orange-500 hover:text-white cursor-pointer transition-all">
                            {s.toUpperCase()}
                         </div>
                       ))}
                    </div>
                 </div>
                 <button 
                  onClick={() => router.push('/blog')}
                  className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-orange-600 transition-all shadow-xl shadow-slate-200"
                 >
                   Return to Blog
                 </button>
              </div>
            </div>
          </article>
        ) : null}
      </div>
    </div>
  );
}
