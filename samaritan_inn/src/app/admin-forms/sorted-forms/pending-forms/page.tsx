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
import type { FormApiKey } from '@/components/admin/DecisionPanel';

type DetailTarget = { formKey: FormApiKey; id: string } | null;

export default function PendingFormsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [forms, setForms] = useState<PassForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeDetail, setActiveDetail] = useState<DetailTarget>(null);
  const [error, setError] = useState<string | null>(null);

  if (status === 'loading') return null;
  if (status === 'unauthenticated') {
    router.replace('/login');
    return null;
  }
  if (session?.user?.role !== 'admin') {
    router.replace('/pass-form');
    return null;
  }

  const pending = forms.filter(f => f.status === 'PENDING');

  return (
    <div className="min-h-screen flex flex-col">
      <Fetchforms setForms={setForms} setLoading={setLoading} setError={setError} refreshKey={refreshKey} />
      <Navigation />

      <div className="flex-grow bg-gray-100 p-4 flex flex-col items-center">
        <div className="w-full max-w-5xl pt-4">
          <Link href="/admin-forms" className="text-sm text-secondary hover:underline">
            ← Back to Admin Forms
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold text-primary mt-2 mb-6 text-center">
            Pending Forms
          </h1>

          {error && (
            <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
              Couldn&apos;t load forms: {error}. Try signing out and back in.
            </div>
          )}

          <div className="bg-white rounded-md overflow-hidden shadow">
            {loading ? (
              <p className="text-sm text-gray-400 py-6 text-center">Loading forms…</p>
            ) : pending.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">No pending forms.</p>
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
                  {pending.map(f => (
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
        </div>
      </div>

      {activeDetail?.formKey === 'pass-request' && (
        <PassRequestDetailModal
          id={activeDetail.id}
          onClose={() => setActiveDetail(null)}
          onUpdate={() => setRefreshKey(k => k + 1)}
        />
      )}
      {activeDetail?.formKey === 'extended-curfew' && (
        <ExtendedCurfewDetailModal
          id={activeDetail.id}
          onClose={() => setActiveDetail(null)}
          onUpdate={() => setRefreshKey(k => k + 1)}
        />
      )}
      {activeDetail?.formKey === 'work-schedule' && (
        <WorkScheduleDetailModal
          id={activeDetail.id}
          onClose={() => setActiveDetail(null)}
          onUpdate={() => setRefreshKey(k => k + 1)}
        />
      )}
    </div>
  );
}
