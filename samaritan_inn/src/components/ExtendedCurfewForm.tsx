'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import CaseworkerSelect from './CaseworkerSelect';

interface ExtendedCurfewFormProps {
  onClose: () => void;
  residentName?: string;
}

interface FormData {
  todayDate: string;
  residentName: string;
  assignedCaseworkerId: string;
  datesNeeded: string;
  expectedReturnTime: string;
  isOngoing: boolean | null;
  reason: string;
  choreCoveredBy: string;
  choreCoverageSignature: string;
  residentSignature: string;
}

const inputClass =
  'w-full border border-gray-300 rounded px-3 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary';

const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

export default function ExtendedCurfewForm({ onClose, residentName }: ExtendedCurfewFormProps) {
  const { data: session } = useSession();
  const [form, setForm] = useState<FormData>({
    todayDate: new Date().toISOString().slice(0, 10),
    residentName: residentName ?? '',
    assignedCaseworkerId: '',
    datesNeeded: '',
    expectedReturnTime: '',
    isOngoing: null,
    reason: '',
    choreCoveredBy: '',
    choreCoverageSignature: '',
    residentSignature: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const update = (field: keyof FormData, value: string | boolean | null) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.datesNeeded.trim()) {
      setError('Please enter the date(s) needed for the extended curfew.');
      return;
    }
    if (!form.expectedReturnTime) {
      setError('Please enter your expected time of return.');
      return;
    }
    if (form.isOngoing === null) {
      setError('Please select YES or NO for the ongoing need question.');
      return;
    }
    if (!form.reason.trim()) {
      setError('Please provide a reason for your request.');
      return;
    }
    if (!form.residentSignature.trim()) {
      setError('Resident signature is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/pass/extended-curfew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, userId: session?.user?.id }),
      });
      if (!res.ok) throw new Error('Failed to submit');
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-5xl mb-4">✓</div>
        <h2 className="text-xl font-bold text-primary mb-2">Request Submitted!</h2>
        <p className="text-gray-600 mb-6">
          Your Extended Curfew Request has been received and is pending caseworker review.
        </p>
        <button
          onClick={onClose}
          className="bg-secondary text-white px-6 py-2 rounded hover:bg-secondary/80 text-sm font-semibold"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Title */}
      <h2 className="text-xl font-bold text-center text-primary mb-1 uppercase tracking-wide">
        Extended Curfew Request
      </h2>
      <p className="text-center text-xs text-gray-500 mb-5">
        Must be received by Caseworker 48 hours prior to requested date(s)
      </p>

      {/* Today's Date */}
      <div className="mb-4">
        <label className={labelClass}>Today&apos;s Date</label>
        <input
          type="date"
          value={form.todayDate}
          onChange={e => update('todayDate', e.target.value)}
          className={inputClass}
          required
        />
      </div>

      {/* Resident Name - read-only, pre-filled */}
      <div className="mb-4">
        <label className={labelClass}>Resident Name</label>
        <input
          type="text"
          value={form.residentName}
          readOnly
          className={inputClass + ' bg-gray-50 cursor-default'}
        />
      </div>

      {/* Caseworker */}
      <div className="mb-4">
        <label className={labelClass}>Your Caseworker</label>
        <CaseworkerSelect
          value={form.assignedCaseworkerId}
          onChange={id => update('assignedCaseworkerId', id)}
        />
      </div>

      {/* Date(s) needed */}
      <div className="mb-4">
        <label className={labelClass}>Date(s) Needed for Extended Curfew</label>
        <input
          type="text"
          placeholder="e.g. March 5–7, 2026"
          value={form.datesNeeded}
          onChange={e => update('datesNeeded', e.target.value)}
          className={inputClass}
          required
        />
      </div>

      {/* Row: Expected return time + Ongoing YES/NO */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelClass}>Expected Time of Return</label>
          <input
            type="time"
            value={form.expectedReturnTime}
            onChange={e => update('expectedReturnTime', e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Is this an on-going need?</label>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-2 text-sm text-black cursor-pointer">
              <input
                type="radio"
                name="isOngoing"
                checked={form.isOngoing === true}
                onChange={() => update('isOngoing', true)}
                className="accent-secondary"
              />
              YES
            </label>
            <label className="flex items-center gap-2 text-sm text-black cursor-pointer">
              <input
                type="radio"
                name="isOngoing"
                checked={form.isOngoing === false}
                onChange={() => update('isOngoing', false)}
                className="accent-secondary"
              />
              NO
            </label>
          </div>
        </div>
      </div>

      {/* Reason for request */}
      <div className="mb-4">
        <label className={labelClass}>Reason for Request</label>
        <textarea
          rows={4}
          placeholder="Please describe your reason..."
          value={form.reason}
          onChange={e => update('reason', e.target.value)}
          className={inputClass}
          required
        />
      </div>

      {/* Chore coverage name */}
      <div className="mb-4">
        <label className={labelClass}>
          Chore Coverage (if needed) — Please print name
        </label>
        <input
          type="text"
          placeholder="Name of person covering chores"
          value={form.choreCoveredBy}
          onChange={e => update('choreCoveredBy', e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Coverage signature */}
      <div className="mb-4">
        <label className={labelClass}>Signature of Person Providing Coverage</label>
        <input
          type="text"
          placeholder="Type full name as signature"
          value={form.choreCoverageSignature}
          onChange={e => update('choreCoverageSignature', e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Resident signature */}
      <div className="mb-4">
        <label className={labelClass}>
          Resident Signature <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Type full name as signature"
          value={form.residentSignature}
          onChange={e => update('residentSignature', e.target.value)}
          className={inputClass}
          required
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-4 text-sm text-red-600 font-medium">{error}</p>
      )}

      {/* Action buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-secondary text-white px-6 py-2 rounded hover:bg-secondary/80 disabled:bg-secondary/60 text-sm font-semibold"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
}
