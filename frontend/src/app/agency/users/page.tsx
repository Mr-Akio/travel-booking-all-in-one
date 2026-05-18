'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MagnifyingGlassIcon, 
  TrashIcon, 
  UserCircleIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  LockClosedIcon,
  LockOpenIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

import { api } from '@/lib/api';
import AgencyShell from '@/components/agency/Shell';

interface UserItem {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  date_joined: string;
  phone: string;
  is_agency: boolean;
}

type SortKey = 'newest' | 'oldest' | 'active_first' | 'inactive_first';

export default function AdminUsersPage() {
  const router = useRouter();

  const [items, setItems] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  /** -------- Fetch Users -------- */
  const fetchUsers = async () => {
    setLoading(true);
    setMsg('');
    try {
      const data = await api.get<UserItem[]>('/api/users/admin/users/');
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
    fetchUsers();
  }, [router]);

  /** -------- Debounce Search -------- */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(query.trim().toLowerCase());
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  /** -------- Toggle Attributes -------- */
  const handleToggle = async (userId: number, field: 'is_staff' | 'is_active' | 'is_superuser', currentValue: boolean) => {
    setUpdatingIds((prev) => new Set(prev).add(userId));
    
    // Optimistic UI Update
    setItems((prev) =>
      prev.map((u) => (u.id === userId ? ({ ...u, [field]: !currentValue } as UserItem) : u))
    );

    try {
      await api.patch(`/api/users/admin/users/${userId}/`, {
        [field]: !currentValue
      });
    } catch (err: unknown) {
      const e = err as Error;
      alert(e?.message || 'Update failed');
      // Rollback on error
      setItems((prev) =>
        prev.map((u) => (u.id === userId ? ({ ...u, [field]: currentValue } as UserItem) : u))
      );
    } finally {
      setUpdatingIds((prev) => {
        const n = new Set(prev);
        n.delete(userId);
        return n;
      });
    }
  };

  /** -------- Delete Account -------- */
  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    const userId = confirmDeleteId;
    setConfirmDeleteId(null);

    setUpdatingIds((prev) => new Set(prev).add(userId));
    try {
      await api.del(`/api/users/admin/users/${userId}/`);
      setItems((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: unknown) {
      const e = err as Error;
      alert(e?.message || 'Delete failed');
    } finally {
      setUpdatingIds((prev) => {
        const n = new Set(prev);
        n.delete(userId);
        return n;
      });
    }
  };

  /** -------- Filter & Sort -------- */
  const filtered = useMemo(() => {
    let list = items;

    if (debounced) {
      const q = debounced;
      list = list.filter((u) =>
        [u.username, u.email, u.phone ?? ''].join(' ').toLowerCase().includes(q)
      );
    }

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'newest':
          return Date.parse(b.date_joined) - Date.parse(a.date_joined);
        case 'oldest':
          return Date.parse(a.date_joined) - Date.parse(b.date_joined);
        case 'active_first':
          return (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0);
        case 'inactive_first':
          return (a.is_active ? 1 : 0) - (b.is_active ? 1 : 0);
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
              Manage <span className="text-orange-500">Users</span>
            </h1>
            <p className="text-sm md:text-base text-slate-500 font-medium">Control roles, permissions, and lock out accounts at a glance.</p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 md:gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-auto group">
              <input
                placeholder="Search by name, email..."
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
                <option value="newest">Latest Joined</option>
                <option value="oldest">Oldest Joined</option>
                <option value="active_first">Active First</option>
                <option value="inactive_first">Suspended First</option>
              </select>

              <button
                onClick={fetchUsers}
                className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-500 hover:text-orange-500 hover:border-orange-200 transition-all shadow-sm active:scale-95"
                title="Refresh List"
              >
                <ArrowPathIcon className={cx("w-5 h-5 stroke-[2.5]", loading && "animate-spin")} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Table Section */}
        {loading && items.length === 0 ? (
          <SkeletonTable />
        ) : msg ? (
          <div className="bg-red-50 border border-red-100 p-10 rounded-[2.5rem] text-center text-red-600 font-bold shadow-sm">{msg}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100">
            <h2 className="text-xl font-black text-slate-900 mb-2">No users found</h2>
            <p className="text-slate-500 font-medium">Try broadening your search query.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/75">
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">User / Details</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Role Status</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Security / Admin</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Account Access</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {currentItems.map((u) => {
                      const saving = updatingIds.has(u.id);

                      // Role styling
                      let roleLabel = 'Traveler';
                      let roleClass = 'bg-slate-100 text-slate-600 border-slate-200';
                      if (u.is_superuser) {
                        roleLabel = 'Superuser';
                        roleClass = 'bg-orange-50 text-orange-600 border-orange-100 shadow-sm';
                      } else if (u.is_agency) {
                        roleLabel = 'Agency';
                        roleClass = 'bg-blue-50 text-blue-600 border-blue-100 shadow-sm';
                      }

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="w-11 h-11 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                                <UserCircleIcon className="w-8 h-8 text-slate-400" />
                              </div>
                              <div>
                                <div className="text-sm font-black text-slate-800 leading-snug">{u.username}</div>
                                <div className="text-xs font-medium text-slate-400 mt-0.5">{u.email}</div>
                                {u.phone && <div className="text-[10px] font-semibold text-slate-400 mt-0.5">📞 {u.phone}</div>}
                              </div>
                            </div>
                          </td>

                          <td className="p-6">
                            <span className={cx("inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", roleClass)}>
                              {roleLabel}
                            </span>
                          </td>

                          <td className="p-6">
                            <div className="flex items-center gap-4">
                              {/* Toggle Staff */}
                              <button
                                onClick={() => handleToggle(u.id, 'is_staff', u.is_staff)}
                                disabled={saving}
                                className={cx(
                                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border shadow-inner",
                                  u.is_staff 
                                    ? "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100" 
                                    : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
                                )}
                                title="Toggle Staff permission"
                              >
                                {u.is_staff ? <ShieldCheckIcon className="w-3.5 h-3.5" /> : <ShieldExclamationIcon className="w-3.5 h-3.5" />}
                                Staff
                              </button>

                              {/* Toggle Superuser */}
                              <button
                                onClick={() => handleToggle(u.id, 'is_superuser', u.is_superuser)}
                                disabled={saving}
                                className={cx(
                                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border shadow-inner",
                                  u.is_superuser
                                    ? "bg-orange-50 border-orange-100 text-orange-600 hover:bg-orange-100" 
                                    : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
                                )}
                                title="Toggle Superuser status"
                              >
                                Admin
                              </button>
                            </div>
                          </td>

                          <td className="p-6">
                            <button
                              onClick={() => handleToggle(u.id, 'is_active', u.is_active)}
                              disabled={saving}
                              className={cx(
                                "flex items-center gap-2 px-3.5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all shadow-sm",
                                u.is_active
                                  ? "bg-white border-slate-200 text-emerald-600 hover:bg-slate-50"
                                  : "bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100"
                              )}
                            >
                              {u.is_active ? <LockOpenIcon className="w-3.5 h-3.5" /> : <LockClosedIcon className="w-3.5 h-3.5" />}
                              {u.is_active ? 'Active' : 'Suspended'}
                            </button>
                          </td>

                          <td className="p-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-[10px] font-bold text-slate-300 mr-2 uppercase tracking-wider hidden lg:inline">
                                Joined {fmtDate(u.date_joined)}
                              </span>
                              <button
                                onClick={() => setConfirmDeleteId(u.id)}
                                disabled={saving}
                                className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                                title="Delete User Account"
                              >
                                <TrashIcon className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-4 mt-10">
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

      {/* High-Fidelity Confirmation Modal */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative bg-white rounded-[2.5rem] max-w-md w-full p-8 border border-slate-200 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-[1.5rem] flex items-center justify-center mb-6">
              <TrashIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Delete User Account?</h3>
            <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
              This action cannot be undone. It will permanently remove all booking records, profile fields, and platform credentials associated with this account.
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
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </AgencyShell>
  );
}

/* ---------- Skeleton Table Load Partial ---------- */
function SkeletonTable() {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between gap-4">
        <div className="h-4 w-1/4 animate-pulse bg-gray-100 rounded" />
        <div className="h-4 w-1/12 animate-pulse bg-gray-100 rounded" />
      </div>
      <div className="p-6 space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
            <div className="flex items-center gap-4 w-1/3">
              <div className="w-11 h-11 rounded-full animate-pulse bg-gray-100 shrink-0" />
              <div className="space-y-2 w-full">
                <div className="h-4 animate-pulse bg-gray-100 rounded w-2/3" />
                <div className="h-3 animate-pulse bg-gray-100 rounded w-1/2" />
              </div>
            </div>
            <div className="h-6 w-16 animate-pulse bg-gray-100 rounded-full" />
            <div className="h-9 w-24 animate-pulse bg-gray-100 rounded-xl" />
            <div className="h-8 w-8 animate-pulse bg-gray-100 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
