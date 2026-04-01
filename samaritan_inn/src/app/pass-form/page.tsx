'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';
import WorkScheduleForm from '@/components/WorkScheduleForm';
import ExtendedCurfewForm from '@/components/ExtendedCurfewForm';
import PassRequestForm from '@/components/PassRequestForm';
import PassRequestDetailModal from '@/components/admin/PassRequestDetailModal';
import ExtendedCurfewDetailModal from '@/components/admin/ExtendedCurfewDetailModal';
import WorkScheduleDetailModal from '@/components/admin/WorkScheduleDetailModal';

type FormType = 'work-schedule' | 'extended-curfew' | 'pass-request' | null;

type ActivityRow = {
  formType: string;
  submittedAt: string;
  requestedDates: string;
  caseworker: string;
  decision: string;
};

type AdminFormType = 'Extended Curfew' | 'Pass Request' | 'Work Schedule';

type AdminRow = {
  id: string;
  formType: AdminFormType;
  residentName: string;
  submittedAt: string;
  status: string;
  isUnread: boolean;
};

type DetailModal = { type: AdminFormType; id: string } | null;

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    APPROVED: 'bg-green-100 text-green-800',
    DENIED: 'bg-red-100 text-red-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${styles[status?.toUpperCase()] ?? styles.PENDING}`}>
      {status ?? 'PENDING'}
    </span>
  );
};

export default function PassFormPage() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const userName = session?.user?.name || 'Resident';

  // User view state
  const [activeForm, setActiveForm] = useState<FormType>(null);
  const [activityFeed, setActivityFeed] = useState<ActivityRow[]>([]);

  // Admin view state
  const [adminForms, setAdminForms] = useState<AdminRow[]>([]);
  const [loadingForms, setLoadingForms] = useState(true);
  const [activeDetail, setActiveDetail] = useState<DetailModal>(null);

  const getRowColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return 'bg-green-100 text-green-900';
      case 'DENIED': return 'bg-red-100 text-red-900';
      case 'PENDING':
      default: return 'bg-yellow-100 text-yellow-900';
    }
  };

  // Fetch for user view
  useEffect(() => {
    if (isAdmin) return;
    async function fetchForms() {
      try {
        const [curfewRes, passRes, workRes] = await Promise.all([
          fetch('/api/pass/extended-curfew'),
          fetch('/api/pass/pass-request'),
          fetch('/api/pass/work-schedule'),
        ]);
        const curfews = await curfewRes.json();
        const passes = await passRes.json();
        const works = await workRes.json();

        const curfewRows: ActivityRow[] = curfews.map((r: Record<string, string>) => ({
          formType: 'Extended Curfew',
          submittedAt: r.submittedAt,
          requestedDates: r.datesNeeded,
          caseworker: r.adminName ?? '—',
          decision: r.status ?? 'PENDING',
        }));
        const passRows: ActivityRow[] = passes.map((r: Record<string, string>) => ({
          formType: 'Pass Request',
          submittedAt: r.submittedAt,
          requestedDates: r.datesRequested,
          caseworker: r.adminName ?? '—',
          decision: r.status ?? 'PENDING',
        }));
        const workRows: ActivityRow[] = works.map((r: Record<string, string>) => ({
          formType: 'Work Schedule',
          submittedAt: r.submittedAt,
          requestedDates: new Date(r.weekOf).toLocaleDateString(),
          caseworker: r.enteredByInitials ?? '—',
          decision: 'PENDING',
        }));

        const combined = [...curfewRows, ...passRows, ...workRows].sort(
          (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );
        setActivityFeed(combined);
      } catch (err) {
        console.error('Failed to fetch activity feed:', err);
      }
    }
    fetchForms();
  }, [isAdmin]);

  // Fetch for admin view
  const refreshAdminForms = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingForms(true);
    try {
      const [curfewRes, passRes, workRes] = await Promise.all([
        fetch('/api/pass/extended-curfew'),
        fetch('/api/pass/pass-request'),
        fetch('/api/pass/work-schedule'),
      ]);
      const curfews = await curfewRes.json();
      const passes = await passRes.json();
      const works = await workRes.json();

      const curfewRows: AdminRow[] = curfews.map((r: Record<string, string>) => ({
        id: r.id,
        formType: 'Extended Curfew' as AdminFormType,
        residentName: r.residentName ?? '—',
        submittedAt: r.submittedAt,
        status: r.status ?? 'PENDING',
        isUnread: (r.status ?? 'PENDING') === 'PENDING',
      }));
      const passRows: AdminRow[] = passes.map((r: Record<string, string>) => ({
        id: r.id,
        formType: 'Pass Request' as AdminFormType,
        residentName: r.residentName ?? '—',
        submittedAt: r.submittedAt,
        status: r.status ?? 'PENDING',
        isUnread: (r.status ?? 'PENDING') === 'PENDING',
      }));
      const workRows: AdminRow[] = works.map((r: Record<string, string>) => ({
        id: r.id,
        formType: 'Work Schedule' as AdminFormType,
        residentName: r.residentName ?? '—',
        submittedAt: r.submittedAt,
        status: r.status ?? 'PENDING',
        isUnread: (r.status ?? 'PENDING') === 'PENDING',
      }));

      const combined = [...curfewRows, ...passRows, ...workRows].sort((a, b) => {
        if (a.isUnread !== b.isUnread) return a.isUnread ? -1 : 1;
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      });

      setAdminForms(combined);
    } catch (err) {
      console.error('Failed to fetch admin forms:', err);
    } finally {
      setLoadingForms(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    refreshAdminForms();
  }, [refreshAdminForms]);

  if (status === 'loading') return null;

  // ── ADMIN VIEW ──────────────────────────────────────────────────────────────
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary">Pass Forms</h1>
            <p className="text-secondary font-semibold mt-1">Hi, {userName} (Admin)</p>
          </div>

          {loadingForms ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-secondary border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Resident Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Form Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date Submitted</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {adminForms.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-500">
                        No previous forms found.
                      </td>
                    </tr>
                  ) : (
                    adminForms.map((row) => (
                      <tr
                        key={`${row.formType}-${row.id}`}
                        className={row.isUnread ? 'bg-white font-semibold' : 'bg-white font-normal'}
                      >
                        <td className="px-6 py-4 text-gray-900 flex items-center gap-2">
                          {row.isUnread && (
                            <span className="inline-block w-2 h-2 rounded-full bg-secondary flex-shrink-0" />
                          )}
                          {row.residentName}
                        </td>
                        <td className="px-6 py-4 text-gray-700">{row.formType}</td>
                        <td className="px-6 py-4 text-gray-700">
                          {new Date(row.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setActiveDetail({ type: row.formType, id: row.id })}
                            className="text-sm text-secondary font-semibold hover:underline"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Detail modals */}
          {activeDetail?.type === 'Pass Request' && (
            <PassRequestDetailModal
              id={activeDetail.id}
              onClose={() => setActiveDetail(null)}
              onUpdate={refreshAdminForms}
            />
          )}
          {activeDetail?.type === 'Extended Curfew' && (
            <ExtendedCurfewDetailModal
              id={activeDetail.id}
              onClose={() => setActiveDetail(null)}
              onUpdate={refreshAdminForms}
            />
          )}
          {activeDetail?.type === 'Work Schedule' && (
            <WorkScheduleDetailModal
              id={activeDetail.id}
              onClose={() => setActiveDetail(null)}
              onUpdate={refreshAdminForms}
            />
          )}
        </main>
      </div>
    );
  }

  // ── USER VIEW ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Form cards */}
        <div className="flex flex-wrap justify-center gap-8 mt-10">
          <button
            onClick={() => setActiveForm('work-schedule')}
            className="w-64 h-40 bg-white border-2 border-red-500 rounded-lg flex items-center justify-center hover:shadow-lg transition-shadow"
          >
            <span className="text-red-500 text-2xl font-bold text-center">
              Work<br />Schedule
            </span>
          </button>

          <button
            onClick={() => setActiveForm('extended-curfew')}
            className="w-64 h-40 bg-white border-2 border-green-500 rounded-lg flex items-center justify-center hover:shadow-lg transition-shadow"
          >
            <span className="text-green-500 text-2xl font-bold text-center">
              Extended<br />Curfew
            </span>
          </button>

          <button
            onClick={() => setActiveForm('pass-request')}
            className="w-64 h-40 bg-white border-2 border-blue-700 rounded-lg flex items-center justify-center hover:shadow-lg transition-shadow"
          >
            <span className="text-blue-700 text-2xl font-bold text-center">
              Pass<br />Request
            </span>
          </button>
        </div>

        {/* History */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-primary mb-4">
            History of Your Previously Submitted Forms
          </h2>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Form Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date Submitted</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Requested Dates</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Caseworker</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {activityFeed.map((row, index) => (
                  <tr key={index} className={getRowColor(row.decision)}>
                    <td className="px-6 py-4">{row.formType}</td>
                    <td className="px-6 py-4">{new Date(row.submittedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{row.requestedDates}</td>
                    <td className="px-6 py-4">{row.caseworker}</td>
                    <td className="px-6 py-4">{row.decision}</td>
                  </tr>
                ))}
                {activityFeed.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500">
                      No previous forms found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal overlay for forms */}
        {activeForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto p-6 relative">
              <button
                onClick={() => setActiveForm(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
              >
                &times;
              </button>
              {activeForm === 'work-schedule' && (
                <WorkScheduleForm onClose={() => setActiveForm(null)} residentName={userName} />
              )}
              {activeForm === 'extended-curfew' && (
                <ExtendedCurfewForm onClose={() => setActiveForm(null)} residentName={userName} />
              )}
              {activeForm === 'pass-request' && (
                <PassRequestForm onClose={() => setActiveForm(null)} residentName={userName} />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
