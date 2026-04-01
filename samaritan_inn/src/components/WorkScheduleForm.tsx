'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import CaseworkerSelect from './CaseworkerSelect';
import ResidentSearch from './ResidentSearch';
import { EmploymentStatus, Transportation } from '@prisma/client';

interface WorkScheduleFormProps {
  onClose: () => void;
  residentName?: string;
}

interface FormData {
  residentName: string;
  room: string;
  employmentStatus: EmploymentStatus;
  employerName: string;
  employerLocation: string;
  weekOf: string;
  transportation: Transportation;
  estimatedTravelTime: string;
  residentSignature: string;
  signatureDate: string;
}

const inputClass =
  'w-full border border-gray-300 rounded px-3 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary';

const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

export default function WorkScheduleForm({ onClose, residentName }: WorkScheduleFormProps) {
  const { data: session } = useSession();
  const [form, setForm] = useState<FormData>({
    residentName: residentName ?? '',
    room: '',
    employmentStatus: 'EMPLOYED' as EmploymentStatus,
    employerName: '',
    employerLocation: '',
    weekOf: new Date().toISOString().slice(0, 10),
    transportation: 'BIKE' as Transportation,
    estimatedTravelTime: '',
    residentSignature: '',
    signatureDate: new Date().toISOString().slice(0, 10)
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const update = (field: keyof FormData, value: string | boolean | null) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.employmentStatus) {
      setError('Please enter your employment status.');
      return;
    }
    if (!form.employerName.trim()) {
      setError('Please enter the name of your employer. If you are unemployed, enter N/A.');
      return;
    }
    if (!form.weekOf.trim()) {
      setError('Please select dates.');
      return;
    }
    if (!form.transportation.trim()) {
      setError('Please provide your method of transportation.');
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
          Your Work Schedule Form has been received and is pending caseworker review.
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
          Work Schedule Form
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
  
        {/* Room */}
        <div className="mb-4">
          <label className={labelClass}>Room</label>
          <input
            type="text"
            value={form.room}
            onChange={e => update('room', e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Employment status */}
        <div className="mb-4">
          <label className={labelClass}>Employment Status</label>
          <select
            value={form.employmentStatus}
            onChange={e => update('employmentStatus', e.target.value as EmploymentStatus)}
            className={inputClass}
            required
          >
            <option value="EMPLOYED">Employed</option>
            <option value="UNEMPLOYED">Unemployed</option>
          </select>
        </div>

        {/* Employer name */}
        <div className="mb-4">
          <label className={labelClass}>Employer Name</label>
          <input
            type="text"
            value={form.employerName}
            onChange={e => update('employerName', e.target.value)}
            className={inputClass}
            required
          />
        </div>

        {/* Employer location */}
        <div className="mb-4">
          <label className={labelClass}>Employer Location</label>
          <input
            type="text"
            value={form.employerLocation}
            onChange={e => update('employerLocation', e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Week of */}
      <div className="mb-4">
        <label className={labelClass}>Week of</label>
        <input
          type="date"
          value={form.weekOf}
          onChange={e => update('weekOf', e.target.value)}
          className={inputClass}
          required
        />
      </div>
  
        {/* Transportation */}
        <div className="mb-4">
          <label className={labelClass}>Transportation</label>
          <select
            value={form.transportation}
            onChange={e => update('transportation', e.target.value as Transportation)}
            className={inputClass}
            required
          >
            <option value="WALK">Walk</option>
            <option value="BIKE">Bike</option>
            <option value="OWN_CAR">Own car</option>
            <option value="RIDE">Need/have a ride</option>
          </select>
        </div>
  
        {/* Estimated travel time */}
        <div className="mb-4">
          <label className={labelClass}>Estimated travel time</label>
          <input
            type="text"
            value={form.estimatedTravelTime}
            onChange={e => update('estimatedTravelTime', e.target.value)}
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
            className="bg-secondary text-white px-6 py-2 rounded hover:bg-secondary/80 disabled:bg-secondary/60 text-sm font-semibold"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    );
}
