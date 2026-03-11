'use client';

import React, { useState } from 'react';
import Navigation from '@/components/Navigation';

const CalendarFormPage = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
  });
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<{ start: string; end: string; label: string }[]>([]);
  const [selectedStart, setSelectedStart] = useState<{ start: string; end: string; label: string } | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
    setError('');
    setSuccess(false);
  };

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    setSelectedStart(null);
    setSelectedDuration(null);
    setSlots([]);
    setLoadingSlots(true);

    const res = await fetch(`/api/get-available-slots?date=${selectedDate}`);
    const data = await res.json();
    setSlots(data);
    setLoadingSlots(false);
  };

  const handleStartClick = (slot: { start: string; end: string; label: string }) => {
    if (selectedStart?.start === slot.start) {
      // Deselect if clicking same slot
      setSelectedStart(null);
      setSelectedDuration(null);
    } else {
      setSelectedStart(slot);
      setSelectedDuration(null);
    }
    setError('');
  };

  const handleDurationClick = (minutes: number) => {
    if (!selectedStart) return;

    // Check that all slots in the range are available
    const startTime = new Date(selectedStart.start);
    const endTime = new Date(startTime.getTime() + minutes * 60 * 1000);

    // Find all slots that would be covered
    const neededSlots = slots.filter(slot => {
      const slotStart = new Date(slot.start);
      return slotStart >= startTime && slotStart < endTime;
    });

    const expectedCount = minutes / 15;
    if (neededSlots.length < expectedCount) {
      setError(`Not enough consecutive available slots for ${minutes} minutes. Please pick a different start time.`);
      return;
    }

    setSelectedDuration(minutes);
    setError('');
  };

  const getEndTime = () => {
    if (!selectedStart || !selectedDuration) return '';
    const end = new Date(new Date(selectedStart.start).getTime() + selectedDuration * 60 * 1000);
    return end.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Chicago'
    });
  };

  const getEndISO = () => {
    if (!selectedStart || !selectedDuration) return '';
    return new Date(new Date(selectedStart.start).getTime() + selectedDuration * 60 * 1000).toISOString();
  };

  // Check if a duration is possible from the selected start time
  const isDurationAvailable = (minutes: number) => {
    if (!selectedStart) return false;
    const startTime = new Date(selectedStart.start);
    const endTime = new Date(startTime.getTime() + minutes * 60 * 1000);
    const neededSlots = slots.filter(slot => {
      const slotStart = new Date(slot.start);
      return slotStart >= startTime && slotStart < endTime;
    });
    return neededSlots.length === minutes / 15;
  };

  const handleSubmit = async () => {
    if (!form.title || !selectedStart || !selectedDuration) {
      setError('Please fill in the Event Title, select a start time, and choose a duration.');
      return;
    }

    const res = await fetch('/api/submit-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        startDate: selectedStart.start,
        endDate: getEndISO(),
        description: form.description,
        location: form.location,
      }),
    });

    if (res.ok) {
      setSuccess(true);
      setForm({ title: '', description: '', location: '' });
      setDate('');
      setSlots([]);
      setSelectedStart(null);
      setSelectedDuration(null);
    } else {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="flex-grow bg-gray-100 p-4 flex flex-col items-center">
        <div className="w-full max-w-4xl p-6 bg-white shadow-md rounded-md">
          <h1 className="text-4xl font-bold mb-4 text-black">Schedule a Calendar Event</h1>
          <p className="text-lg mb-6 text-black">
            Fill in the details below and select an available time slot.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              id="title"
              label="Event Title"
              type="text"
              placeholder="e.g. Client Meeting"
              value={form.title}
              onChange={handleChange}
              color="blue"
              required
            />
            <FormField
              id="location"
              label="Location (optional)"
              type="text"
              placeholder="e.g. Conference Room B"
              value={form.location}
              onChange={handleChange}
              color="green"
            />
            <div className="md:col-span-2">
              <FormField
                id="description"
                label="Description (optional)"
                type="textarea"
                placeholder="Add any notes or details about this event..."
                value={form.description}
                onChange={handleChange}
                color="yellow"
              />
            </div>
          </div>

          {/* Date Picker */}
          <div className="mt-6 p-4 bg-white rounded-lg shadow-md border-2 border-purple-600">
            <label className="block text-sm font-semibold mb-2 text-purple-600">
              Select a Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={handleDateChange}
              className="w-full text-sm text-gray-800 bg-transparent outline-none"
            />
          </div>

          {/* Step 1 — Pick Start Time */}
          {loadingSlots && (
            <div className="mt-4 text-sm text-gray-500">Loading available slots...</div>
          )}

          {slots.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-black mb-1">Step 1 — Select a Start Time</h2>
              <p className="text-sm text-gray-500 mb-3">Click an available time to begin.</p>
              <div className="grid grid-cols-4 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot.start}
                    onClick={() => handleStartClick(slot)}
                    className={`p-2 rounded border text-sm font-medium transition duration-200 ${
                      selectedStart?.start === slot.start
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white border-blue-600 text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Pick Duration */}
          {selectedStart && (
            <div className="mt-6 p-4 bg-white rounded-lg shadow-md border-2 border-orange-600">
              <h2 className="text-lg font-semibold text-black mb-1">Step 2 — Select a Duration</h2>
              <p className="text-sm text-gray-500 mb-3">Starting at {selectedStart.label}</p>
              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 45, 60].map((minutes) => (
                  <button
                    key={minutes}
                    onClick={() => handleDurationClick(minutes)}
                    disabled={!isDurationAvailable(minutes)}
                    className={`p-2 rounded border text-sm font-medium transition duration-200 ${
                      selectedDuration === minutes
                        ? 'bg-orange-600 text-white border-orange-600'
                        : isDurationAvailable(minutes)
                        ? 'bg-white border-orange-600 text-orange-600 hover:bg-orange-50'
                        : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {minutes < 60 ? `${minutes} min` : '1 hour'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selection Summary */}
          {selectedStart && selectedDuration && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm">
              ✓ Selected: {selectedStart.label} to {getEndTime()} ({selectedDuration} minutes)
            </div>
          )}

          {slots.length === 0 && date && !loadingSlots && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 text-sm">
              No available slots for this date. Please try another day.
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
              ✓ Your event has been successfully added to the calendar.
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-300"
            >
              Submit Event
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            This form submits directly to Salesforce via the REST API.
          </p>
        </div>
      </div>
    </div>
  );
};

type Color = 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

const FormField = ({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  color,
  required,
}: {
  id: string;
  label: string;
  type: 'text' | 'datetime-local' | 'textarea';
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  color: Color;
  required?: boolean;
}) => {
  const borderColors: Record<Color, string> = {
    blue: 'border-blue-600 focus-within:bg-blue-50',
    green: 'border-green-600 focus-within:bg-green-50',
    yellow: 'border-yellow-600 focus-within:bg-yellow-50',
    purple: 'border-purple-600 focus-within:bg-purple-50',
    orange: 'border-orange-600 focus-within:bg-orange-50',
  };
  const labelColors: Record<Color, string> = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
  };

  return (
    <div className={`p-4 bg-white rounded-lg shadow-md border-2 ${borderColors[color]} transition duration-300`}>
      <label htmlFor={id} className={`block text-sm font-semibold mb-2 ${labelColors[color]}`}>
        {label}{required && <span className="ml-1 text-red-400">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          rows={3}
          className="w-full text-sm text-gray-800 bg-transparent outline-none resize-none placeholder-gray-400"
        />
      ) : (
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full text-sm text-gray-800 bg-transparent outline-none placeholder-gray-400"
        />
      )}
    </div>
  );
};

export default CalendarFormPage;