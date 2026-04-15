'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import Link from 'next/link';

type ScheduledEvent = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  caseWorker: string;
  salesforceId: string | null;
  createdAt: string;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Chicago',
  });

export default function MyEventsPage() {
  const [events, setEvents] = useState<ScheduledEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/my-events')
      .then((r) => r.json())
      .then((data) => {
        setEvents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.startTime) >= now);
  const past = events.filter((e) => new Date(e.startTime) < now);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="flex-grow bg-gray-100 p-4 flex flex-col items-center">
        <div className="w-full max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold text-black">My Scheduled Events</h1>
            <Link
              href="/calendar-form"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition"
            >
              + Schedule New Event
            </Link>
          </div>

          {loading && (
            <p className="text-gray-500 text-sm">Loading your events...</p>
          )}

          {!loading && events.length === 0 && (
            <div className="p-6 bg-white rounded-lg shadow text-center text-gray-500">
              You haven&apos;t scheduled any events yet.{' '}
              <Link href="/calendar-form" className="text-blue-600 underline">
                Schedule one now.
              </Link>
            </div>
          )}

          {/* Upcoming Events */}
          {upcoming.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Upcoming</h2>
              <div className="space-y-3">
                {upcoming.map((event) => (
                  <EventCard key={event.id} event={event} past={false} />
                ))}
              </div>
            </section>
          )}

          {/* Past Events */}
          {past.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-400 mb-3">Past Events</h2>
              <div className="space-y-3">
                {[...past].reverse().map((event) => (
                  <EventCard key={event.id} event={event} past={true} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function EventCard({ event, past }: { event: ScheduledEvent; past: boolean }) {
  return (
    <div
      className={`p-4 bg-white rounded-lg shadow border-l-4 transition ${
        past
          ? 'border-gray-300 opacity-50'
          : 'border-blue-500'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-lg font-semibold ${past ? 'text-gray-400' : 'text-gray-900'}`}>
            {event.title}
          </p>
          <p className={`text-sm mt-1 ${past ? 'text-gray-400' : 'text-gray-600'}`}>
            {formatDate(event.startTime)}
          </p>
          <p className={`text-sm ${past ? 'text-gray-400' : 'text-gray-600'}`}>
            {formatTime(event.startTime)} &ndash; {formatTime(event.endTime)}
          </p>
          <p className={`text-sm mt-1 ${past ? 'text-gray-400' : 'text-gray-500'}`}>
            With: {event.caseWorker}
          </p>
        </div>
        {past && (
          <span className="shrink-0 text-xs font-medium bg-gray-100 text-gray-400 px-2 py-1 rounded">
            Past
          </span>
        )}
        {!past && (
          <span className="shrink-0 text-xs font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded">
            Upcoming
          </span>
        )}
      </div>
    </div>
  );
}
