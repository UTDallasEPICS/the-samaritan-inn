'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';
import WorkScheduleForm from '@/components/WorkScheduleForm';
import ExtendedCurfewForm from '@/components/ExtendedCurfewForm';
import PassRequestForm from '@/components/PassRequestForm';

type FormType = 'work-schedule' | 'extended-curfew' | 'pass-request' | null;

type ActivityRow = {
  formType: string;
  submittedAt: string;
  requestedDates: string;
  caseworker: string;
  decision: string;
};

export default function PassFormPage() {
  const { data: session } = useSession();
  const [activeForm, setActiveForm] = useState<FormType>(null);
  const [activityFeed, setActivityFeed] = useState<ActivityRow[]>([]);

  const userName = session?.user?.name || 'Resident';

  // Fetch all forms and combine them
  /*
  useEffect(() => {
    async function fetchForms() {
      try {
      
        const [curfewRes, passRes, workRes] = await Promise.all([
          fetch('/api/pass/extended-curfew'),
          fetch('/api/pass/pass-request'),
          fetch('/api/pass/work-schedule')
        ]);

        const curfews = await curfewRes.json();
        const passes = await passRes.json();
        const works = await workRes.json();
        

        const curfewRows: ActivityRow[] = curfews.map((r: any) => ({
          formType: 'Extended Curfew',
          submittedAt: r.submittedAt,
          requestedDates: r.datesNeeded,
          caseworker: r.adminName ?? r.assignedCaseworkerId ?? '—',
          decision: r.status ?? 'Pending'
        }));

        const passRows: ActivityRow[] = passes.map((r: any) => ({
          formType: 'Pass Request',
          submittedAt: r.submittedAt,
          requestedDates: r.datesRequested,
          caseworker: r.adminName ?? '—',
          decision: r.status ?? 'Pending'
        }));

        
        const workRows: ActivityRow[] = works.map((r: any) => ({
          formType: 'Work Schedule',
          submittedAt: r.submittedAt,
          requestedDates: new Date(r.weekOf).toLocaleDateString(),
          caseworker: r.enteredByInitials ?? '—',
          decision: 'Pending'
        }));

        const combined = [...curfewRows, ...passRows, ...workRows].sort(
          (a, b) =>
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime()
        );
        

        setActivityFeed(combined);
      } catch (err) {
        console.error('Failed to fetch activity feed:', err);
      }
    }

    fetchForms();
  }, []);

  */

  useEffect(() => {
    async function fetchForms() {
      try {
        const res = await fetch('/api/pass/extended-curfew');
        const curfews = await res.json();

        const curfewRows = curfews.map((r: any) => ({
          formType: 'Extended Curfew',
          submittedAt: r.submittedAt,
          requestedDates: r.datesNeeded,
          caseworker: r.adminName ?? r.assignedCaseworkerId ?? '—',
          decision: r.status ?? 'Pending'
        }));

        const sorted = curfewRows.sort(
          (a: any, b: any) =>
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime()
        );

        setActivityFeed(sorted);
      } catch (err) {
        console.error('Failed to fetch activity feed:', err);
      }
    }

    fetchForms();
  }, []);

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

        {/* History of Previously Submitted Forms */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-[#00167c] mb-4">
            History of Your Previously Submitted Forms
          </h2>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Form Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Date Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Requested Dates
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Caseworker
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Decision
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {activityFeed.map((row, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4">{row.formType}</td>
                    <td className="px-6 py-4">
                      {new Date(row.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">{row.requestedDates}</td>
                    <td className="px-6 py-4">{row.caseworker}</td>
                    <td className="px-6 py-4">{row.decision}</td>
                  </tr>
                ))}

                {activityFeed.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-6 text-gray-500"
                    >
                      No form submissions yet.
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
                <WorkScheduleForm
                  onClose={() => setActiveForm(null)}
                  residentName={userName}
                />
              )}

              {activeForm === 'extended-curfew' && (
                <ExtendedCurfewForm
                  onClose={() => setActiveForm(null)}
                  residentName={userName}
                />
              )}

              {activeForm === 'pass-request' && (
                <PassRequestForm
                  onClose={() => setActiveForm(null)}
                  residentName={userName}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}