'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import CaseworkerSelect from './CaseworkerSelect';
import ResidentSearch from './ResidentSearch';
console.log("PASS REQUEST ROUTE HIT");

interface PassRequestFormProps {
  onClose: () => void;
  residentName?: string;
}

interface FormData {
  residentName: string;
  todayDate: string;
  assignedCaseworkerId: string;
  datesRequested: string;
  reason: string;
  choreCoveredById: string;
  choreCoverageSignature: string;
  residentSignature: string;
  signatureDate: string;
  
}

const inputClass =
  'w-full border border-gray-300 rounded px-3 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#29abe2]';

const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

// First pass: based on the schema in lab

export default function PassRequestForm({ onClose, residentName }: PassRequestFormProps) {
  
  const { data: session } = useSession();
    const [form, setForm] = useState<FormData>({
      residentName: residentName ?? '',
      assignedCaseworkerId: '',
      todayDate: new Date().toISOString().slice(0, 10),
      datesRequested: '',
      reason: '',
      choreCoveredById: '',
      choreCoverageSignature: '',
      residentSignature: '',
      signatureDate: new Date().toISOString().slice(0, 10),
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    
    const update = (field: keyof FormData, value: string | boolean | null) =>
    setForm(prev => ({ ...prev, [field]: value }));
    
    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!form.datesRequested.trim()) {
      setError('Please enter the date(s) requested for the pass.');
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
      console.log('Submitting pass request to /api/pass/pass-request', { form, userId: session?.user?.id });
      const res = await fetch('/api/pass/pass-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, userId: session?.user?.id }),
      });
      console.log('Pass request response status:', res.status);
      if (!res.ok) throw new Error('Failed to submit');
      onClose();
    } catch {
      console.log("ERROR SUBMITTING PASS REQUEST")
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
          Your Pass Request has been received and is pending caseworker review.
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
      <h2 className="text-xl font-bold text-center text-[#00167c] mb-1 uppercase tracking-wide">
        Resident Pass Request
      </h2>
      <p className="text-center text-xs text-gray-500 mb-5">
        Must be received by Caseworker 48 hours prior to requested date(s)
      </p>
      
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
      
      {/* Caseworker */}
      <div className="mb-4">
        <label className={labelClass}>Your Caseworker</label>
        <CaseworkerSelect
          value={form.assignedCaseworkerId}
          onChange={id => update('assignedCaseworkerId', id)}
        />
      </div>
      
      {/* Date(s) requested */}
      <div className="mb-4">
        <label className={labelClass}>Date(s) Requested for Pass</label>
        <input
          type="text"
          placeholder="e.g. March 5–7, 2026"
          value={form.datesRequested}
          onChange={e => update('datesRequested', e.target.value)}
          className={inputClass}
          required
        />
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
          Chore Coverage (if needed) — Search resident name
        </label>
        <ResidentSearch
          value={form.choreCoveredById}
          onChange={id => update('choreCoveredById', id)}
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
      
      {/* Signature's Date */}
      <div className="mb-4">
        <label className={labelClass}>Signature Date</label>
        <input
          type="date"
          value={form.signatureDate}
          onChange={e => update('signatureDate', e.target.value)}
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
          className="bg-[#29abe2] text-white px-6 py-2 rounded hover:bg-[#64bee3] disabled:bg-[#64bee3] text-sm font-semibold"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
}
