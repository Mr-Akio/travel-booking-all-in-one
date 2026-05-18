'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  MagnifyingGlassIcon, 
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  FolderOpenIcon,
  ArrowPathIcon,
  PowerIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

import { api, mediaUrl } from '@/lib/api';
import AgencyShell from '@/components/agency/Shell';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  image: string | null;
  is_published: boolean;
  created_at: string;
  author_email: string;
}

type SortKey = 'newest' | 'oldest' | 'published_first' | 'drafts_first';

export default function AdminBlogsPage() {
  const router = useRouter();

  const [items, setItems] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  /** -------- Fetch Blogs -------- */
  const fetchBlogs = async () => {
    setLoading(true);
    setMsg('');
    try {
      const data = await api.get<BlogPost[]>('/api/users/admin/blogs/');
      setItems(data);
    } catch (err: unknown) {
      const e = err as Error;
      setMsg(e?.message || 'Load failed');
      if ((e?.message || '').includes('401')) {
        router.replace('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [router]);

  /** -------- Debounce Search -------- */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(query.trim().toLowerCase());
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  /** -------- Toggle Publish Status -------- */
  const handleTogglePublish = async (blogId: number, currentStatus: boolean) => {
    setUpdatingIds((prev) => new Set(prev).add(blogId));
    
    // Optimistic UI Update
    setItems((prev) =>
      prev.map((b) => (b.id === blogId ? ({ ...b, is_published: !currentStatus } as BlogPost) : b))
    );

    try {
      await api.patch(`/api/users/admin/blogs/${blogId}/`, {
        is_published: !currentStatus
      });
    } catch (err: unknown) {
      const e = err as Error;
      alert(e?.message || 'Update failed');
      // Rollback on error
      setItems((prev) =>
        prev.map((b) => (b.id === blogId ? ({ ...b, is_published: currentStatus } as BlogPost) : b))
      );
    } finally {
      setUpdatingIds((prev) => {
        const n = new Set(prev);
        n.delete(blogId);
        return n;
      });
    }
  };

  /** -------- Delete Blog Post -------- */
  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    const blogId = confirmDeleteId;
    setConfirmDeleteId(null);

    setUpdatingIds((prev) => new Set(prev).add(blogId));
    try {
      await api.del(`/api/users/admin/blogs/${blogId}/`);
      setItems((prev) => prev.filter((b) => b.id !== blogId));
    } catch (err: unknown) {
      const e = err as Error;
      alert(e?.message || 'Delete failed');
    } finally {
      setUpdatingIds((prev) => {
        const n = new Set(prev);
        n.delete(blogId);
        return n;
      });
    }
  };

  /** -------- Filter & Sort -------- */
  const filtered = useMemo(() => {
    let list = items;

    if (debounced) {
      const q = debounced;
      list = list.filter((b) =>
        [b.title, b.content, b.author_email ?? ''].join(' ').toLowerCase().includes(q)
      );
    }

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'newest':
          return Date.parse(b.created_at) - Date.parse(a.created_at);
        case 'oldest':
          return Date.parse(a.created_at) - Date.parse(b.created_at);
        case 'published_first':
          return (b.is_published ? 1 : 0) - (a.is_published ? 1 : 0);
        case 'drafts_first':
          return (a.is_published ? 1 : 0) - (b.is_published ? 1 : 0);
        default:
          return 0;
      }
    });

    return list;
  }, [items, debounced, sort]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fmtDate = (d?: string) =>
    d ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(d)) : '-';

  function cx(...cls: (string | false | undefined)[]) {
    return cls.filter(Boolean).join(' ');
  }

  return (
    <AgencyShell>
      <div className="space-y-10 pb-20 font-sans">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Manage <span className="text-orange-500">Blogs</span>
            </h1>
            <p className="text-sm md:text-base text-slate-500 font-medium">Review and publish traveler stories and community posts.</p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 md:gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-auto group">
              <input
                placeholder="Search blogs..."
                className="h-14 w-full sm:w-64 md:w-72 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm group-hover:border-slate-300"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-orange-500 transition-colors">
                <MagnifyingGlassIcon className="w-5 h-5 stroke-[2.5]" />
              </span>
            </div>

            <div className="flex w-full sm:w-auto gap-3">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-14 flex-1 sm:flex-none bg-white border border-slate-200 rounded-2xl px-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm cursor-pointer"
              >
                <option value="newest">Latest Posted</option>
                <option value="oldest">Oldest Posted</option>
                <option value="published_first">Published First</option>
                <option value="drafts_first">Unapproved First</option>
              </select>

              <button
                onClick={fetchBlogs}
                className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-500 hover:text-orange-500 hover:border-orange-200 transition-all shadow-sm active:scale-95"
                title="Refresh List"
              >
                <ArrowPathIcon className={cx("w-5 h-5 stroke-[2.5]", loading && "animate-spin")} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading && items.length === 0 ? (
          <SkeletonGrid />
        ) : msg ? (
          <div className="bg-red-50 border border-red-100 p-10 rounded-[2.5rem] text-center text-red-600 font-bold shadow-sm">{msg}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 text-slate-300">
              <FolderOpenIcon className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">No blogs found</h2>
            <p className="text-slate-500 font-medium">Try broadening your search query.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {currentItems.map((b) => {
                const saving = updatingIds.has(b.id);

                return (
                  <div
                    key={b.id}
                    className="group bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 overflow-hidden flex flex-col transition-all hover:-translate-y-2"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-50">
                      {b.image ? (
                        <Image
                          src={mediaUrl(b.image)}
                          alt={b.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-300">
                          <FolderOpenIcon className="w-10 h-10 mb-2 opacity-20" />
                          <span className="text-[10px] font-black uppercase tracking-widest">No Cover Photo</span>
                        </div>
                      )}

                      <div className="absolute top-4 left-4">
                        <span
                          className={cx(
                            "flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md",
                            b.is_published
                              ? "bg-emerald-500/90 text-white"
                              : "bg-slate-900/90 text-white"
                          )}
                        >
                          {b.is_published ? <CheckCircleIcon className="w-3 h-3" /> : <XCircleIcon className="w-3 h-3" />}
                          {b.is_published ? 'Published' : 'Draft / Closed'}
                        </span>
                      </div>
                    </div>

                    <div className="p-7 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 shadow-inner w-fit">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        <span>{fmtDate(b.created_at)}</span>
                      </div>

                      <h3 className="text-lg font-black text-slate-900 mb-1.5 line-clamp-1 group-hover:text-orange-500 transition-colors">
                        {b.title}
                      </h3>
                      
                      <div className="text-xs text-slate-400 font-bold mb-4">
                        By: <span className="text-slate-600 font-black">{b.author_email}</span>
                      </div>

                      <p className="text-slate-500 text-[13px] font-medium line-clamp-3 mb-6 leading-relaxed">
                        {b.content.replace(/<[^>]*>/g, '') /* Strip html just in case */}
                      </p>

                      <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                        <button
                          onClick={() => handleTogglePublish(b.id, b.is_published)}
                          disabled={saving}
                          className={cx(
                            "flex-1 py-3 flex items-center justify-center gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border",
                            b.is_published
                              ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                              : "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100"
                          )}
                        >
                          {saving ? (
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <PowerIcon className="w-3.5 h-3.5" />
                          )}
                          {saving ? 'Syncing...' : b.is_published ? 'Unpublish' : 'Approve & Publish'}
                        </button>

                        <button
                          onClick={() => setConfirmDeleteId(b.id)}
                          disabled={saving}
                          className="w-11 h-11 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                          title="Delete Post"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-4 mt-16">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-200 disabled:opacity-30 disabled:hover:bg-orange-500 active:scale-95"
                >
                  Previous
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 bg-orange-500 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-200 disabled:opacity-30 disabled:hover:bg-orange-500 active:scale-95"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative bg-white rounded-[2.5rem] max-w-md w-full p-8 border border-slate-200 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-[1.5rem] flex items-center justify-center mb-6">
              <TrashIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Delete Blog Post?</h3>
            <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
              This action cannot be undone. The post will be permanently deleted from the community roll and cannot be recovered.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-4 border border-slate-200 hover:bg-slate-50 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-red-100 active:scale-95"
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}
    </AgencyShell>
  );
}

/* ---------- Skeleton Loaders ---------- */
function SkeletonGrid() {
  return (
    <ul className="grid grid-cols-1 gap-10 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="overflow-hidden rounded-[2.5rem] border bg-white shadow-xl shadow-slate-100">
          <div className="h-44 w-full animate-pulse bg-gray-100" />
          <div className="space-y-3 p-7">
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-gray-100" />
            <div className="h-10 animate-pulse rounded-lg bg-gray-100 w-full" />
          </div>
        </li>
      ))}
    </ul>
  );
}
