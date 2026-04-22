'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import CaseworkerSelect from './CaseworkerSelect';

type EmploymentStatus = 'EMPLOYED' | 'UNEMPLOYED';
type Transportation = 'WALK' | 'BIKE' | 'OWN_CAR' | 'RIDE';
type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

const DAYS: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

interface WorkScheduleFormProps {
  onClose: () => void;
  residentName?: string;
}

interface DayEntry {
  isOff: boolean;
  startTime: string;
  endTime: string;
}

interface FormData {
  residentName: string;
  room: string;
  assignedCaseworkerId: string;
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

function emptyDayMap(): Record<DayOfWeek, DayEntry> {
  return DAYS.reduce((acc, d) => {
    acc[d] = { isOff: false, startTime: '', endTime: '' };
    return acc;
  }, {} as Record<DayOfWeek, DayEntry>);
}

export default function WorkScheduleForm({ onClose, residentName }: WorkScheduleFormProps) {
  const { data: session } = useSession();
  const [form, setForm] = useState<FormData>({
    residentName: residentName ?? '',
    room: '',
    assignedCaseworkerId: '',
    employmentStatus: 'EMPLOYED',
    employerName: '',
    employerLocation: '',
    weekOf: new Date().toISOString().slice(0, 10),
    transportation: 'BIKE',
    estimatedTravelTime: '',
    residentSignature: '',
    signatureDate: new Date().toISOString().slice(0, 10),
  });
  const [days, setDays] = useState<Record<DayOfWeek, DayEntry>>(emptyDayMap);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const update = <K extends keyof FormData>(field: K, value: FormData[K]) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const updateDay = (day: DayOfWeek, patch: Partial<DayEntry>) =>
    setDays(prev => ({ ...prev, [day]: { ...prev[day], ...patch } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.employmentStatus === 'EMPLOYED' && !form.employerName.trim()) {
      setError('Please enter the name of your employer.');
      return;
    }
    if (!form.weekOf.trim()) {
      setError('Please select a week.');
      return;
    }
    if (!form.residentSignature.trim()) {
      setError('Resident signature is required.');
      return;
    }

    const dayPayload = DAYS.map(d => ({
      dayOfWeek: d,
      startTime: days[d].isOff ? null : days[d].startTime || null,
      endTime: days[d].isOff ? null : days[d].endTime || null,
    }));

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/pass/work-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          userId: session?.user?.id,
          days: dayPayload,
        }),
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
      <h2 className="text-xl font-bold text-center text-primary mb-1 uppercase tracking-wide">
        Work Schedule Form
      </h2>
      <p className="text-center text-xs text-gray-500 mb-5">
        Must be received by Caseworker 48 hours prior to requested date(s)
      </p>

      <div className="mb-4">
        <label className={labelClass}>Resident Name</label>
        <input
          type="text"
          value={form.residentName}
          readOnly
          className={inputClass + ' bg-gray-50 cursor-default'}
        />
      </div>

      <div className="mb-4">
        <label className={labelClass}>Room</label>
        <input
          type="text"
          value={form.room}
          onChange={e => update('room', e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="mb-4">
        <label className={labelClass}>Your Caseworker</label>
        <CaseworkerSelect
          value={form.assignedCaseworkerId}
          onChange={id => update('assignedCaseworkerId', id)}
        />
      </div>

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

      {form.employmentStatus === 'EMPLOYED' && (
        <>
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

          <div className="mb-4">
            <label className={labelClass}>Employer Location</label>
            <input
              type="text"
              value={form.employerLocation}
              onChange={e => update('employerLocation', e.target.value)}
              className={inputClass}
            />
          </div>
        </>
      )}

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

      <div className="mb-4">
        <label className={labelClass}>Weekly Schedule</label>
        <div className="overflow-x-auto border border-gray-200 rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-600">
                <th className="px-3 py-2">Day</th>
                <th className="px-3 py-2">Start</th>
                <th className="px-3 py-2">End</th>
                <th className="px-3 py-2">Day Off</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {DAYS.map(day => (
                <tr key={day}>
                  <td className="px-3 py-2 text-gray-700 font-medium">{day}</td>
                  <td className="px-3 py-2">
                    <input
                      type="time"
                      value={days[day].startTime}
                      disabled={days[day].isOff}
                      onChange={e => updateDay(day, { startTime: e.target.value })}
                      className="border border-gray-300 rounded px-2 py-1 text-sm text-black disabled:bg-gray-100"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="time"
                      value={days[day].endTime}
                      disabled={days[day].isOff}
                      onChange={e => updateDay(day, { endTime: e.target.value })}
                      className="border border-gray-300 rounded px-2 py-1 text-sm text-black disabled:bg-gray-100"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={days[day].isOff}
                      onChange={e =>
                        updateDay(day, {
                          isOff: e.target.checked,
                          startTime: e.target.checked ? '' : days[day].startTime,
                          endTime: e.target.checked ? '' : days[day].endTime,
                        })
                      }
                      className="accent-secondary"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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

      <div className="mb-4">
        <label className={labelClass}>Estimated travel time</label>
        <input
          type="text"
          value={form.estimatedTravelTime}
          onChange={e => update('estimatedTravelTime', e.target.value)}
          className={inputClass}
        />
      </div>

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

      {error && <p className="mt-4 text-sm text-red-600 font-medium">{error}</p>}

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
