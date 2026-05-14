'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  image: string | null;
  author_name: string;
  created_at: string;
  slug: string; 
}

import { Skeleton } from '@/components/ui/Skeleton';

export default function BlogHomePage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;
  const router = useRouter();

  useEffect(() => {
    api.get<BlogPost[]>('/api/users/blog/posts/')
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Unable to load posts');
        setLoading(false);
      });

    const token = localStorage.getItem('access');
    setIsLoggedIn(!!token);
  }, []);

  const handleCreateClick = () => {
    router.push('/blog/create');
  };

  const handleReadMore = (slug: string) => {
    router.push(`/blog/${slug}`);
  };

  // Pagination Logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-24">
      {/* Hero Section */}
      <div className="relative h-[300px] md:h-[400px] w-full flex items-center justify-center overflow-hidden">
        <Image
          src="/images/temple-6963458_1920.jpg"
          alt="Blog Hero"
          fill
          priority
          className="object-cover scale-105"
        />
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <span className="px-4 py-1.5 rounded-full bg-orange-500 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-block">Travel Insights</span>
          <h1 className="text-3xl md:text-6xl font-black text-white mb-4 drop-shadow-2xl">The <span className="text-orange-400">Travel Blog</span></h1>
          <p className="text-slate-200 text-base md:text-xl max-w-2xl mx-auto font-medium">Stories, tips, and guides from our global community of explorers.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
           <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-800">Featured Articles</h2>
              <div className="h-1.5 w-20 bg-orange-500 mt-4 rounded-full"></div>
           </div>
           {isLoggedIn && (
             <button
               onClick={handleCreateClick}
               className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 hover:shadow-orange-100 uppercase tracking-widest"
             >
               + Create New Post
             </button>
           )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden flex flex-col shadow-sm">
                 <Skeleton className="h-64 w-full rounded-none" />
                 <div className="p-8 space-y-4 flex-1 flex flex-col">
                   <div className="flex items-center gap-2">
                     <Skeleton className="w-6 h-6 rounded-full" />
                     <Skeleton className="h-3 w-20" />
                   </div>
                   <Skeleton className="h-6 w-3/4" />
                   <div className="space-y-2">
                     <Skeleton className="h-3 w-full" />
                     <Skeleton className="h-3 w-5/6" />
                   </div>
                   <div className="mt-auto pt-6 border-t border-slate-50">
                     <Skeleton className="h-4 w-24" />
                   </div>
                 </div>
               </div>
             ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 p-10 rounded-[2.5rem] text-center text-red-600 font-bold">{error}</div>
        ) : posts.length === 0 ? (
          <div className="bg-white p-20 rounded-[2.5rem] text-center border border-dashed border-slate-200">
             <p className="text-slate-400 text-lg italic">No articles found. Be the first to share a story!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {currentPosts.map((post) => (
                <div
                  key={post.id}
                  className="group bg-white rounded-[2.5rem] border border-slate-100 card-shadow overflow-hidden flex flex-col transition-all hover:-translate-y-2"
                >
                  <div className="relative h-64 w-full overflow-hidden">
                    {post.image ? (
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-300">
                         <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                         <span className="text-[10px] font-black uppercase tracking-widest">No Cover Image</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                       <span className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-black text-slate-800 uppercase tracking-widest shadow-sm">
                          {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                       </span>
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                       <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-600">
                          {post.author_name.charAt(0).toUpperCase()}
                       </div>
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{post.author_name}</span>
                    </div>
                    
                    <h3 className="text-xl font-black text-slate-800 mb-4 group-hover:text-orange-500 transition-colors line-clamp-2 leading-tight">
                      {post.title}
                    </h3>
                    
                    <p className="text-slate-500 text-sm line-clamp-3 mb-8 leading-relaxed">
                      {post.content}
                    </p>
                    
                    <div className="mt-auto pt-6 border-t border-slate-50">
                      <button
                        onClick={() => handleReadMore(post.slug)}
                        className="text-orange-500 font-black text-xs uppercase tracking-[0.2em] hover:text-slate-900 transition-all flex items-center gap-2"
                      >
                        Read Full Story <span className="text-lg">→</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Buttons */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-4 mt-16">
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
          </>
        )}
      </div>
    </div>
  );
}
