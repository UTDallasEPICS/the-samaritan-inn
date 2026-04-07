'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';

interface PassForm {
  formType: string;
  name: string;
  submittedAt: string;
  status: string;
}

export default function AdminPassFormPage() {
  const { data: session } = useSession();

  const [forms, setForms] = useState<PassForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchForms() {
      try {
        const [curfewRes, passRes] = await Promise.all([
          fetch('/api/pass/extended-curfew'),
          fetch('/api/pass/pass-request'),
        ]);
        const curfews = await curfewRes.json();
        const passes = await passRes.json();

        const mapped: PassForm[] = [
          ...curfews.map((r: any) => ({
            formType: 'Extended Curfew',
            name: r.residentName ?? '—',
            submittedAt: r.submittedAt,
            status: r.status ?? 'Pending',
          })),
          ...passes.map((r: any) => ({
            formType: 'Pass Request',
            name: r.residentName ?? '—',
            submittedAt: r.submittedAt,
            status: r.status ?? 'Pending',
          })),
        ];

        setForms(mapped.sort(
          (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        ));
      } catch (err) {
        console.error('Failed to fetch forms:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchForms();
  }, []);

  const filtered = forms
    .filter(f => f.name.toLowerCase().includes(query.toLowerCase()))
    .filter(f => statusFilter ? f.status === statusFilter : true)
    .filter(f => dateFilter ? f.submittedAt.startsWith(dateFilter) : true);

  // if (status === 'loading') return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="flex-grow bg-gray-100 p-4 flex flex-col items-center">
        <div className="w-full max-w-4xl pt-4">

          {/* Welcome Section */}
          <div className="flex flex-col items-center text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-[#00167c] mb-6">
              Pass Forms Home
            </h1>
            <p className="text-xl text-[#231f20] max-w-2xl mb-6">
              Hi, {session?.user?.name ?? 'Admin'}
            </p>

            {/* Search Bar */}
            <div className="relative flex items-center border-2 border-blue-500 rounded-md bg-gray-100 px-4 py-2 w-full mb-2">
              <input
                type="text"
                placeholder="Search Forms"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-center italic text-gray-400"
              />
              <div className="flex items-center gap-2 text-blue-600">
                <SearchIcon />
                <TuneIcon
                  className="cursor-pointer"
                  onClick={() => setShowFilters(!showFilters)}
                />
              </div>
            </div>

            {/* Filters Dropdown */}
            {showFilters && (
              <div className="flex gap-4 mb-4 p-4 border border-gray-200 rounded-md bg-white w-full">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-700">Status</label>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700"
                  >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Denied">Denied</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-700">Submitted Date</label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={e => setDateFilter(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700"
                  />
                </div>
                <button
                  onClick={() => { setStatusFilter(''); setDateFilter(''); }}
                  className="self-end text-sm text-blue-500 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* Results Table */}
            {query || statusFilter || dateFilter ? (
              loading ? (
                <p className="text-sm text-gray-400 py-2">Loading forms…</p>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">No forms found.</p>
              ) : (
                <table className="w-full text-sm border-collapse bg-white rounded-md overflow-hidden mt-2">
                  <thead>
                    <tr className="text-left border-b border-gray-200 text-gray-700">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Form Type</th>
                      <th className="py-3 px-4">Submitted</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((f, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-700">{f.name}</td>
                        <td className="py-3 px-4 text-gray-700">{f.formType}</td>
                        <td className="py-3 px-4 text-gray-700">{new Date(f.submittedAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium
                            ${f.status === 'Approved' ? 'bg-green-100 text-green-700' :
                              f.status === 'Denied' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'}`}>
                            {f.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            ) : null}

          </div>
        </div>
      </div>
    </div>
  );
}