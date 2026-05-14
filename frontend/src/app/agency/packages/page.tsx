'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  UsersIcon,
  CalendarIcon,
  PowerIcon,
  FolderOpenIcon
} from '@heroicons/react/24/outline';

import { api, mediaUrl } from '@/lib/api';
import type { TourPackage } from '@/types';
import AgencyShell from '@/components/agency/Shell';

type SortKey = 'newest' | 'oldest' | 'price_asc' | 'price_desc';

export default function AgencyPackagesPage() {
  const router = useRouter();

  const [items, setItems] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());

  /** -------- Fetch -------- */
  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<TourPackage[]>('/api/users/agency/packages/');
        setItems(data);
      } catch (err: unknown) {
        const e = err as Error;
        setMsg(e?.message || 'Load failed');
        if ((e?.message || '').includes('401')) router.replace('/login');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  /** -------- Debounce -------- */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(query.trim().toLowerCase());
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  /** -------- List: filter + sort -------- */
  const filtered = useMemo(() => {
    let list = items;

    if (debounced) {
      const q = debounced;
      list = list.filter((p) =>
        [p.title, p.location ?? '', p.description ?? ''].join(' ').toLowerCase().includes(q),
      );
    }

    const byDate = (a?: string, b?: string, dir: 1 | -1 = 1) =>
      ((b ? Date.parse(b) : 0) - (a ? Date.parse(a) : 0)) * dir;

    const byNumber = (a?: number, b?: number, dir: 1 | -1 = 1) =>
      ((a ?? 0) - (b ?? 0)) * dir;

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'newest':
          return byDate(a.start_date, b.start_date, 1);
        case 'oldest':
          return byDate(a.start_date, b.start_date, -1);
        case 'price_asc':
          return byNumber(Number(a.price as unknown as number), Number(b.price as unknown as number), 1);
        case 'price_desc':
          return byNumber(Number(a.price as unknown as number), Number(b.price as unknown as number), -1);
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

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this package?')) return;
    try {
      await api.del(`/api/users/agency/packages/${id}/`);
      setItems((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      const e = err as Error;
      alert(e?.message || 'Delete failed');
    }
  };

  const handleToggleAvailable = async (pkgId: number, current: boolean) => {
    setUpdatingIds((prev) => new Set(prev).add(pkgId));
    setItems((prev) =>
      prev.map((p) => (p.id === pkgId ? ({ ...p, available: !current } as TourPackage) : p)),
    );

    try {
      const fd = new FormData();
      fd.append('available', String(!current)); 
      await api.patch(`/api/users/agency/packages/${pkgId}/`, fd); 
    } catch (err: unknown) {
      const e = err as Error;
      setItems((prev) =>
        prev.map((p) => (p.id === pkgId ? ({ ...p, available: current } as TourPackage) : p)),
      );
      alert(e?.message || 'Update availability failed');
    } finally {
      setUpdatingIds((prev) => {
        const n = new Set(prev);
        n.delete(pkgId);
        return n;
      });
    }
  };

  const fmtDate = (d?: string) =>
    d ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(d)) : '-';

  function cx(...cls: (string | false | undefined)[]) {
    return cls.filter(Boolean).join(' ');
  }

  return (
    <AgencyShell>
      <div className="space-y-10 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              My <span className="text-orange-500">Packages</span>
            </h1>
            <p className="text-sm md:text-base text-slate-500 font-medium">Manage and monitor your tour collections effortlessly.</p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 md:gap-4">
            <div className="relative w-full sm:w-auto group">
              <input
                placeholder="Search packages..."
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
                <option value="newest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="price_asc">Price: Low</option>
                <option value="price_desc">Price: High</option>
              </select>

              <Link
                href="/agency/packages/create"
                className="h-14 flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-6 md:px-8 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl shadow-slate-200 hover:shadow-orange-100"
              >
                <PlusIcon className="w-5 h-5 stroke-[3]" /> <span className="hidden sm:inline">Create</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <SkeletonGrid />
        ) : msg ? (
          <div className="bg-red-50 border border-red-100 p-10 rounded-[2.5rem] text-center text-red-600 font-bold shadow-sm">{msg}</div>
        ) : filtered.length === 0 ? (
          <EmptyState onCreateHref="/agency/packages/create" />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {currentItems.map((p) => {
                const available = (p as unknown as { available?: boolean }).available ?? false;
                const saving = updatingIds.has(p.id);

              return (
                <div
                  key={p.id}
                  className="group bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 overflow-hidden flex flex-col transition-all hover:-translate-y-2"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    {p.image ? (
                      <Image
                        src={mediaUrl(p.image)}
                        alt={p.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-300">
                         <FolderOpenIcon className="w-10 h-10 mb-2 opacity-20" />
                         <span className="text-[10px] font-black uppercase tracking-widest">No Cover</span>
                      </div>
                    )}
                    
                    <div className="absolute top-4 left-4">
                      <span
                        className={cx(
                          "flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md",
                          available
                            ? "bg-emerald-500/90 text-white"
                            : "bg-slate-900/90 text-white"
                        )}
                      >
                        {available ? <CheckCircleIcon className="w-3 h-3" /> : <XCircleIcon className="w-3 h-3" />}
                        {available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>

                  <div className="p-7 flex flex-col flex-1">
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-2.5 mb-3.5">
                       <span className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-orange-100 shadow-sm">
                          <MapPinIcon className="w-2.5 h-2.5" />
                          {p.location || 'Global'}
                       </span>
                       <span className="flex items-center gap-1.5 text-slate-400 text-[9px] font-bold uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                          <UsersIcon className="w-3 h-3 text-slate-400" />
                          {p.slots} Slots Left
                       </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 mb-1.5 line-clamp-1 group-hover:text-orange-500 transition-colors">
                       {p.title}
                    </h3>
                    <p className="text-slate-500 text-[13px] font-medium line-clamp-2 mb-6 leading-relaxed">
                       {p.description}
                    </p>

                    <div className="bg-slate-50 rounded-2xl p-4 mb-6 space-y-2.5 border border-slate-100 shadow-inner">
                       <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          <span>Timeline</span>
                       </div>
                       <div className="text-[12px] font-black text-slate-800 leading-none pl-5">
                          {fmtDate(p.start_date)} — {fmtDate(p.end_date)}
                       </div>
                    </div>

                    <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between gap-3">
                       <button
                          onClick={() => handleToggleAvailable(p.id, available)}
                          disabled={saving}
                          className={cx(
                            "flex-1 py-3 flex items-center justify-center gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border",
                            available
                              ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                              : "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100"
                          )}
                       >
                          {saving ? (
                             <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                             <PowerIcon className="w-3.5 h-3.5" />
                          )}
                          {saving ? 'Syncing...' : available ? 'Deactivate' : 'Activate'}
                       </button>

                       <div className="flex items-center gap-2">
                          <Link
                            href={`/agency/packages/${p.id}/edit`}
                            className="w-11 h-11 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all shadow-sm"
                            title="Edit Package"
                          >
                            <PencilSquareIcon className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="w-11 h-11 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                            title="Delete Package"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                       </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
    </AgencyShell>
  );
}

/* ---------- UI Partials ---------- */

function SkeletonGrid() {
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="overflow-hidden rounded-2xl border bg-white">
          <div className="h-44 w-full animate-pulse bg-gray-100" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-gray-100" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-7 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-7 animate-pulse rounded-lg bg-gray-100" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ onCreateHref }: { onCreateHref: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100">
      <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 text-slate-300">
        <FolderOpenIcon className="w-10 h-10" />
      </div>
      <h2 className="text-xl font-black text-slate-900 mb-2">No packages found</h2>
      <p className="text-slate-500 font-medium mb-8">Try creating your first tour package to get started.</p>
      <Link
        href={onCreateHref}
        className="flex items-center gap-2 bg-orange-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-orange-100"
      >
        <PlusIcon className="w-5 h-5 stroke-[3]" /> Create First Package
      </Link>
    </div>
  );
}
