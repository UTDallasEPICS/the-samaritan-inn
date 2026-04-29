'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Fetchforms, { type PassForm } from '@/components/Fetchforms';
import StatusBadge from '@/components/StatusBadge';
import PassRequestDetailModal from '@/components/admin/PassRequestDetailModal';
import ExtendedCurfewDetailModal from '@/components/admin/ExtendedCurfewDetailModal';
import WorkScheduleDetailModal from '@/components/admin/WorkScheduleDetailModal';
import AdminUserCreateForm from '@/components/admin/AdminUserCreateForm';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import Badge from '@mui/material/Badge';
import type { FormApiKey } from '@/components/admin/DecisionPanel';

type DetailTarget = { formKey: FormApiKey; id: string } | null;

export default function AdminPassFormPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [forms, setForms] = useState<PassForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeDetail, setActiveDetail] = useState<DetailTarget>(null);

  if (status === 'loading') return null;
  if (status === 'unauthenticated') {
    router.replace('/login');
    return null;
  }
  if (session?.user?.role !== 'admin') {
    router.replace('/pass-form');
    return null;
  }

  const pendingCount = forms.filter(f => f.status === 'PENDING').length;

  const filtered = forms
    .filter(f => f.name.toLowerCase().includes(query.toLowerCase()))
    .filter(f =>
      statusFilter ? f.status.toUpperCase() === statusFilter.toUpperCase() : true
    )
    .filter(f => {
      const submitted = new Date(f.submittedAt).getTime();
      const from = dateFrom ? new Date(dateFrom).getTime() : null;
      const to = dateTo ? new Date(dateTo + 'T23:59:59').getTime() : null;
      if (from && submitted < from) return false;
      if (to && submitted > to) return false;
      return true;
    });

  const handleUpdated = () => setRefreshKey(k => k + 1);

  return (
    <div className="min-h-screen flex flex-col">
      <Fetchforms setForms={setForms} setLoading={setLoading} setError={setError} refreshKey={refreshKey} />
      <Navigation />

      <div className="flex-grow bg-gray-100 p-4 flex flex-col items-center">
        <div className="w-full max-w-5xl pt-4">
          <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Pass Forms — Admin
            </h1>
            <p className="text-lg text-[#231f20] mb-4">
              Hi, {session.user.name ?? 'Admin'}
            </p>
            <Badge badgeContent={pendingCount} color="primary">
              <span className="text-sm font-semibold text-gray-700 px-3">
                Pending Forms
              </span>
            </Badge>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
              Couldn&apos;t load forms: {error}. Try signing out and back in.
            </div>
          )}

          <div className="relative flex items-center border-2 border-secondary rounded-md bg-white px-4 py-2 w-full mb-2">
            <input
              type="text"
              placeholder="Search by resident name"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-700"
            />
            <div className="flex items-center gap-2 text-secondary">
              <SearchIcon />
              <TuneIcon
                className="cursor-pointer"
                onClick={() => setShowFilters(!showFilters)}
              />
            </div>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-4 mb-4 p-4 border border-gray-200 rounded-md bg-white">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-700">Status</label>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="DENIED">Denied</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-700">Submitted From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-700">Submitted To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700"
                />
              </div>
              <button
                onClick={() => {
                  setStatusFilter('');
                  setDateFrom('');
                  setDateTo('');
                }}
                className="self-end text-sm text-secondary hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}

          {(query || statusFilter || dateFrom || dateTo) && (
            <div className="bg-white rounded-md overflow-hidden shadow mb-6">
              {loading ? (
                <p className="text-sm text-gray-400 py-6 text-center">Loading forms…</p>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">No forms found.</p>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-100">
                    <tr className="text-left border-b border-gray-200 text-gray-700">
                      <th className="py-3 px-4">Resident Name</th>
                      <th className="py-3 px-4">Form Type</th>
                      <th className="py-3 px-4">Submitted</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(f => (
                      <tr key={`${f.formKey}-${f.id}`} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-700">{f.name}</td>
                        <td className="py-3 px-4 text-gray-700">{f.formType}</td>
                        <td className="py-3 px-4 text-gray-700">
                          {new Date(f.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={f.status} />
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setActiveDetail({ formKey: f.formKey, id: f.id })}
                            className="text-sm text-secondary font-semibold hover:underline"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 mt-6">
            <Badge
              badgeContent={pendingCount}
              color="primary"
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              sx={{ width: '100%', display: 'block', '& .MuiBadge-badge': { top: 12, right: 12 } }}
            >
              <Link
                href="/admin-forms/sorted-forms/pending-forms"
                className="block w-full border-2 border-secondary rounded-md bg-white px-4 py-3 text-center font-semibold text-lg text-primary hover:bg-gray-50"
              >
                Pending Forms
              </Link>
            </Badge>
            <Link
              href="/admin-forms/sorted-forms/past-forms"
              className="block w-full border-2 border-secondary rounded-md bg-white px-4 py-3 text-center font-semibold text-lg text-primary hover:bg-gray-50"
            >
              Past Forms
            </Link>
          </div>

          <AdminUserCreateForm />
        </div>
      </div>

      {activeDetail?.formKey === 'pass-request' && (
        <PassRequestDetailModal
          id={activeDetail.id}
          onClose={() => setActiveDetail(null)}
          onUpdate={handleUpdated}
        />
      )}
      {activeDetail?.formKey === 'extended-curfew' && (
        <ExtendedCurfewDetailModal
          id={activeDetail.id}
          onClose={() => setActiveDetail(null)}
          onUpdate={handleUpdated}
        />
      )}
      {activeDetail?.formKey === 'work-schedule' && (
        <WorkScheduleDetailModal
          id={activeDetail.id}
          onClose={() => setActiveDetail(null)}
          onUpdate={handleUpdated}
        />
      )}
    </div>
  );
}
