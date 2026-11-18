'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export type FormApiKey = 'pass-request' | 'extended-curfew' | 'work-schedule';

interface DecisionPanelProps {
  formId: string;
  formType: FormApiKey;
  currentStatus: string;
  initialComments?: string | null;
  onSubmitted: () => void;
}

const fieldLabel = 'block text-sm font-semibold text-gray-700 mb-1';
const fieldValue =
  'text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded px-3 py-2 w-full';

export default function DecisionPanel({
  formId,
  formType,
  currentStatus,
  initialComments,
  onSubmitted,
}: DecisionPanelProps) {
  const { data: session } = useSession();
  const isLocked = currentStatus !== 'PENDING';
  const [decision, setDecision] = useState<'APPROVED' | 'DENIED' | ''>(
    isLocked ? (currentStatus as 'APPROVED' | 'DENIED') : ''
  );
  const [comments, setComments] = useState(initialComments ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!decision) {
      setError('Please select a decision.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/pass/${formType}/${formId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: decision,
          commentsNotes: comments,
          adminName: session?.user?.name ?? null,
        }),
      });
      if (!res.ok) throw new Error('Update failed');
      onSubmitted();
    } catch {
      setError('Failed to save decision. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-6 space-y-4 flex flex-col">
      <div>
        <div className={fieldLabel}>Current Status</div>
        <div className={fieldValue}>{currentStatus}</div>
      </div>

      <div>
        <div className={fieldLabel}>Decision</div>
        <div className="flex gap-4 mt-1">
          {(['APPROVED', 'DENIED'] as const).map(opt => (
            <label
              key={opt}
              className={`flex items-center gap-2 text-sm font-medium text-gray-700 ${
                isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
              }`}
            >
              <input
                type="radio"
                name="decision"
                value={opt}
                checked={decision === opt}
                onChange={() => setDecision(opt)}
                disabled={isLocked}
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
          disabled={isLocked}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary disabled:bg-gray-50"
          placeholder="Optional notes or reason for your decision..."
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!isLocked && (
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-primary text-white font-semibold py-2 rounded hover:opacity-90 disabled:opacity-50 transition"
        >
          {submitting ? 'Saving…' : 'Submit Decision'}
        </button>
      )}
    </div>
  );
}
