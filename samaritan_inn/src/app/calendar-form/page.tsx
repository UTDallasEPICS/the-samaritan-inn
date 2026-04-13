'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';

const CALENDARS = [
  { label: 'Case Worker 1', ownerId: process.env.NEXT_PUBLIC_SF_OWNER_1! },
  { label: 'Case Worker 2', ownerId: process.env.NEXT_PUBLIC_SF_OWNER_2! },
  { label: 'Case Worker 3', ownerId: process.env.NEXT_PUBLIC_SF_OWNER_3! },
];

type ScheduledEvent = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  caseWorker: string;
  createdAt: string;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Chicago',
  });

const CalendarFormPage = () => {
  const [form, setForm] = useState({ title: '' });
  const [selectedCalendar, setSelectedCalendar] = useState(CALENDARS[0]);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<{ start: string; end: string; label: string }[]>([]);
  const [selectedStart, setSelectedStart] = useState<{ start: string; end: string; label: string } | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [events, setEvents] = useState<ScheduledEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const res = await fetch('/api/my-events');
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
    setError('');
    setSuccess(false);
  };

  const fetchSlots = async (dateStr: string, ownerId: string) => {
    setSelectedStart(null);
    setSelectedDuration(null);
    setSlots([]);
    setLoadingSlots(true);
    const res = await fetch(`/api/get-available-slots?date=${dateStr}&ownerId=${ownerId}`);
    const data = await res.json();
    setSlots(data);
    setLoadingSlots(false);
  };

  const handleCalendarChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cal = CALENDARS.find(c => c.ownerId === e.target.value) ?? CALENDARS[0];
    setSelectedCalendar(cal);
    if (date) fetchSlots(date, cal.ownerId);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    fetchSlots(selectedDate, selectedCalendar.ownerId);
  };

  const handleStartClick = (slot: { start: string; end: string; label: string }) => {
    if (selectedStart?.start === slot.start) {
      setSelectedStart(null);
      setSelectedDuration(null);
    } else {
      setSelectedStart(slot);
      setSelectedDuration(null);
    }
    setError('');
  };

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

  const handleDurationClick = (minutes: number) => {
    if (!selectedStart) return;
    const startTime = new Date(selectedStart.start);
    const endTime = new Date(startTime.getTime() + minutes * 60 * 1000);
    const neededSlots = slots.filter(slot => {
      const slotStart = new Date(slot.start);
      return slotStart >= startTime && slotStart < endTime;
    });
    if (neededSlots.length < minutes / 15) {
      setError(`Not enough consecutive slots for ${minutes} minutes. Pick a different start time.`);
      return;
    }
    setSelectedDuration(minutes);
    setError('');
  };

  const getEndTime = () => {
    if (!selectedStart || !selectedDuration) return '';
    return new Date(new Date(selectedStart.start).getTime() + selectedDuration * 60 * 1000)
      .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Chicago' });
  };

  const getEndISO = () => {
    if (!selectedStart || !selectedDuration) return '';
    return new Date(new Date(selectedStart.start).getTime() + selectedDuration * 60 * 1000).toISOString();
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
        ownerId: selectedCalendar.ownerId,
        caseWorkerLabel: selectedCalendar.label,
      }),
    });

    if (res.ok) {
      setSuccess(true);
      setForm({ title: '' });
      setDate('');
      setSlots([]);
      setSelectedStart(null);
      setSelectedDuration(null);
      fetchEvents();
    } else {
      setError('Something went wrong. Please try again.');
    }
  };

  const now = new Date();
  const upcoming = events.filter(e => new Date(e.startTime) >= now);
  const past = events.filter(e => new Date(e.startTime) < now);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="flex-grow bg-gray-100 p-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">

          {/* ── Left: Schedule Form ── */}
          <div className="w-full lg:w-1/2 p-6 bg-white shadow-md rounded-md self-start">
            <h1 className="text-3xl font-bold mb-4 text-black">Schedule an Event</h1>

            {/* Title */}
            <div className="p-4 bg-white rounded-lg shadow-md border-2 border-blue-600 focus-within:bg-blue-50 transition">
              <label htmlFor="title" className="block text-sm font-semibold mb-2 text-blue-600">
                Event Title <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                type="text"
                placeholder="e.g. Client Meeting"
                value={form.title}
                onChange={handleChange}
                className="w-full text-sm text-gray-800 bg-transparent outline-none placeholder-gray-400"
              />
            </div>

            {/* Calendar Selector */}
            <div className="mt-4 p-4 bg-white rounded-lg shadow-md border-2 border-primary">
              <label className="block text-sm font-semibold mb-2 text-primary">
                Select a Calendar <span className="text-red-400">*</span>
              </label>
              <select
                value={selectedCalendar.ownerId}
                onChange={handleCalendarChange}
                className="w-full text-sm text-gray-800 bg-transparent outline-none"
              >
                {CALENDARS.map(cal => (
                  <option key={cal.ownerId} value={cal.ownerId}>{cal.label}</option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div className="mt-4 p-4 bg-white rounded-lg shadow-md border-2 border-purple-600">
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

            {loadingSlots && (
              <div className="mt-4 text-sm text-gray-500">Loading available slots...</div>
            )}

            {/* Step 1 — Start Time */}
            {slots.length > 0 && (
              <div className="mt-4">
                <h2 className="text-base font-semibold text-black mb-1">Step 1 — Select a Start Time</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {slots.map(slot => (
                    <button
                      key={slot.start}
                      onClick={() => handleStartClick(slot)}
                      className={`p-2 rounded border text-sm font-medium transition ${
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

            {/* Step 2 — Duration */}
            {selectedStart && (
              <div className="mt-4 p-4 bg-white rounded-lg shadow-md border-2 border-orange-600">
                <h2 className="text-base font-semibold text-black mb-1">Step 2 — Select a Duration</h2>
                <p className="text-sm text-gray-500 mb-3">Starting at {selectedStart.label}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[15, 30, 45, 60].map(minutes => (
                    <button
                      key={minutes}
                      onClick={() => handleDurationClick(minutes)}
                      disabled={!isDurationAvailable(minutes)}
                      className={`p-2 rounded border text-sm font-medium transition ${
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

            {selectedStart && selectedDuration && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm">
                ✓ {selectedStart.label} to {getEndTime()} ({selectedDuration} min)
              </div>
            )}

            {slots.length === 0 && date && !loadingSlots && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 text-sm">
                No available slots for this date. Please try another day.
              </div>
            )}

            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                ✓ Event added! It now appears in your events list.
              </div>
            )}

            <div className="mt-5">
              <button
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition"
              >
                Submit Event
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Right: My Events ── */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl font-bold mb-4 text-black">My Events</h2>

            {loadingEvents && (
              <p className="text-sm text-gray-500">Loading your events...</p>
            )}

            {!loadingEvents && events.length === 0 && (
              <div className="p-6 bg-white rounded-lg shadow text-center text-gray-500 text-sm">
                No events yet. Schedule one using the form.
              </div>
            )}

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">Upcoming</h3>
                <div className="space-y-3">
                  {upcoming.map(event => (
                    <EventCard key={event.id} event={event} past={false} />
                  ))}
                </div>
              </div>
            )}

            {/* Past */}
            {past.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-2">Past</h3>
                <div className="space-y-3">
                  {[...past].reverse().map(event => (
                    <EventCard key={event.id} event={event} past={true} />
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

function EventCard({ event, past }: { event: ScheduledEvent; past: boolean }) {
  return (
    <div className={`p-4 bg-white rounded-lg shadow border-l-4 ${past ? 'border-gray-300 opacity-50' : 'border-blue-500'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`font-semibold ${past ? 'text-gray-400' : 'text-gray-900'}`}>{event.title}</p>
          <p className={`text-sm mt-0.5 ${past ? 'text-gray-400' : 'text-gray-600'}`}>{formatDate(event.startTime)}</p>
          <p className={`text-sm ${past ? 'text-gray-400' : 'text-gray-600'}`}>
            {formatTime(event.startTime)} &ndash; {formatTime(event.endTime)}
          </p>
          <p className={`text-sm mt-0.5 ${past ? 'text-gray-400' : 'text-gray-500'}`}>With: {event.caseWorker}</p>
        </div>
        <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded ${past ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600'}`}>
          {past ? 'Past' : 'Upcoming'}
        </span>
      </div>
    </div>
  );
}

export default CalendarFormPage;
