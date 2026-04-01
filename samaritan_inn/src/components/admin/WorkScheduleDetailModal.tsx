'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface Props {
  id: string;
  onClose: () => void;
  onUpdate: () => void;
}

interface WorkScheduleDay {
  id: string;
  dayOfWeek: string;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
}

interface WorkSchedule {
  id: string;
  residentName: string;
  room: string;
  employmentStatus: string;
  employerName: string | null;
  employerLocation: string | null;
  weekOf: string;
  transportation: string;
  estimatedTravelTime: string;
  residentSignature: string;
  signatureDate: string;
  status: string;
  adminName: string | null;
  commentsNotes: string | null;
  decisionDate: string | null;
  submittedAt: string;
  days: WorkScheduleDay[];
}

const fieldLabel = 'block text-sm font-semibold text-gray-700 mb-1';
const fieldValue = 'text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded px-3 py-2 w-full';

const DAY_ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function WorkScheduleDetailModal({ id, onClose, onUpdate }: Props) {
  const { data: session } = useSession();
  const [record, setRecord] = useState<WorkSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [decision, setDecision] = useState<'APPROVED' | 'DENIED' | ''>('');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/pass/work-schedule/${id}`)
      .then(r => r.json())
      .then(data => {
        setRecord(data);
        setDecision((data.status !== 'PENDING' ? data.status : '') as 'APPROVED' | 'DENIED' | '');
        setComments(data.commentsNotes ?? '');
      })
      .catch(() => setError('Failed to load form data.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    if (!decision) { setError('Please select a decision.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/pass/work-schedule/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: decision,
          commentsNotes: comments,
          adminName: session?.user?.name ?? null,
        }),
      });
      if (!res.ok) throw new Error('Update failed');
      onUpdate();
      onClose();
    } catch {
      setError('Failed to save decision. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const sortedDays = record
    ? [...record.days].sort((a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek))
    : [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto relative">

        {/* Header */}
        <div className="flex bg-primary text-white rounded-t-lg items-stretch">
          <div className="flex-1 px-6 py-4 text-xl font-bold">Work Schedule Form</div>
          <div className="flex-1 px-6 py-4 text-xl font-bold border-l border-white/30">Your Decision</div>
          <button onClick={onClose} className="px-5 text-2xl font-bold hover:opacity-75" aria-label="Close">
            &times;
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-secondary border-t-transparent" />
          </div>
        ) : !record ? (
          <div className="p-8 text-center text-red-600">Failed to load form data.</div>
        ) : (
          <div className="flex divide-x divide-gray-200">

            {/* LEFT: Form data */}
            <div className="flex-1 p-6 space-y-4">
              <div>
                <div className={fieldLabel}>Resident Name</div>
                <div className={fieldValue}>{record.residentName}</div>
              </div>
              <div>
                <div className={fieldLabel}>Room</div>
                <div className={fieldValue}>{record.room || '—'}</div>
              </div>
              <div>
                <div className={fieldLabel}>Date Submitted</div>
                <div className={fieldValue}>{new Date(record.submittedAt).toLocaleDateString()}</div>
              </div>
              <div>
                <div className={fieldLabel}>Week Of</div>
                <div className={fieldValue}>{new Date(record.weekOf).toLocaleDateString()}</div>
              </div>
              <div>
                <div className={fieldLabel}>Employment Status</div>
                <div className={fieldValue}>{record.employmentStatus}</div>
              </div>
              {record.employerName && (
                <div>
                  <div className={fieldLabel}>Employer Name</div>
                  <div className={fieldValue}>{record.employerName}</div>
                </div>
              )}
              {record.employerLocation && (
                <div>
                  <div className={fieldLabel}>Employer Location</div>
                  <div className={fieldValue}>{record.employerLocation}</div>
                </div>
              )}
              <div>
                <div className={fieldLabel}>Transportation</div>
                <div className={fieldValue}>{record.transportation}</div>
              </div>
              <div>
                <div className={fieldLabel}>Estimated Travel Time</div>
                <div className={fieldValue}>{record.estimatedTravelTime}</div>
              </div>
              {sortedDays.length > 0 && (
                <div>
                  <div className={fieldLabel}>Weekly Schedule</div>
                  <table className="w-full text-sm border border-gray-200 rounded overflow-hidden">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left text-gray-600">Day</th>
                        <th className="px-3 py-2 text-left text-gray-600">Start</th>
                        <th className="px-3 py-2 text-left text-gray-600">End</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sortedDays.map(d => (
                        <tr key={d.id}>
                          <td className="px-3 py-2 text-gray-700">{d.dayOfWeek}</td>
                          <td className="px-3 py-2 text-gray-700">{d.startTime ?? '—'}</td>
                          <td className="px-3 py-2 text-gray-700">{d.endTime ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div>
                <div className={fieldLabel}>Resident Signature</div>
                <div className={fieldValue}>{record.residentSignature}</div>
              </div>
            </div>

            {/* RIGHT: Decision */}
            <div className="flex-1 p-6 space-y-4 flex flex-col">
              <div>
                <div className={fieldLabel}>Current Status</div>
                <div className={fieldValue}>{record.status}</div>
              </div>
              <div>
                <div className={fieldLabel}>Decision</div>
                <div className="flex gap-4 mt-1">
                  {(['APPROVED', 'DENIED'] as const).map(opt => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                      <input
                        type="radio"
                        name="decision"
                        value={opt}
                        checked={decision === opt}
                        onChange={() => setDecision(opt)}
                        className="accent-primary"
                      />
                      {opt.charAt(0) + opt.slice(1).toLowerCase()}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <label className={fieldLabel}>Reason for Decision (Message to Resident)</label>
                <textarea
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  rows={6}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="Optional notes or reason for your decision..."
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-primary text-white font-semibold py-2 rounded hover:opacity-90 disabled:opacity-50 transition"
              >
                {submitting ? 'Saving…' : 'Submit Decision'}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
