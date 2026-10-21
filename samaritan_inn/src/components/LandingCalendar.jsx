// LandingCalendar.jsx
'use client';

import React, { useMemo, useState } from 'react';

function pad(n) {
  return String(n).padStart(2, '0');
}

function toDateKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function normalizeISODateOnly(iso) {
  if (typeof iso === 'string' && iso.length >= 10) {
    return iso.slice(0, 10);
  }
  return iso;
}

function getMonthLabel(d) {
  return d.toLocaleString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

function addMonths(d, delta) {
  // Always use the first day of the target month.
  // This safely handles December-to-January transitions.
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Build a 42-date grid starting on Sunday.
// The dates are displayed across 14 columns and 3 rows.
function buildMonthGrid(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const startDate = new Date(
    year,
    month,
    1 - firstOfMonth.getDay()
  );

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    return d;
  });
}

export default function LandingCalendar({
  announcements = [],
  className = '',
  onDateSelect,
}) {
  // Current month being displayed
  const [viewDate, setViewDate] = useState(
    () => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  );

  // Currently selected calendar date
  const [selectedDate, setSelectedDate] = useState(
    () => new Date()
  );

  const today = useMemo(() => new Date(), []);

  // Group announcements by YYYY-MM-DD.
  const byDate = useMemo(() => {
    const map = new Map();

    for (const announcement of announcements) {
      const key = normalizeISODateOnly(announcement.date);

      if (!key) continue;

      const existing = map.get(key) || [];
      existing.push(announcement);
      map.set(key, existing);
    }

    return map;
  }, [announcements]);

  // Rebuild the dates whenever the displayed month changes.
  const monthGrid = useMemo(
    () => buildMonthGrid(viewDate),
    [viewDate]
  );

  const monthLabel = getMonthLabel(viewDate);
  const selectedKey = toDateKey(selectedDate);

  const selectedAnnouncements =
    byDate.get(selectedKey) || [];

  // Repeat weekday labels for the 14-column layout.
  const weekDayLabels = [
    'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
    'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
  ];

  // Month navigation handlers
  function handlePreviousMonth() {
    setViewDate((current) => addMonths(current, -1));
  }

  function handleNextMonth() {
    setViewDate((current) => addMonths(current, 1));
  }

  // Return to the current date and month.
  function handleToday() {
    const now = new Date();

    setViewDate(
      new Date(now.getFullYear(), now.getMonth(), 1)
    );

    handleSelect(now);
  }

  // Return to the current month without changing the selected date.
  function handleThisMonth() {
    const now = new Date();

    setViewDate(
      new Date(now.getFullYear(), now.getMonth(), 1)
    );
  }

  function handleSelect(date) {
    setSelectedDate(date);

    if (typeof onDateSelect === 'function') {
      onDateSelect(toDateKey(date));
    }
  }

  return (
    <div
      className={`w-full min-w-0 grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}
    >
      {/* LEFT: Calendar - two-thirds of the width */}
      <section className="md:col-span-2 min-w-0">
        <div className="w-full bg-white rounded-2xl shadow p-3 sm:p-5">

          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={handlePreviousMonth}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-xl text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0caebb]"
              aria-label="Previous month"
            >
              ‹
            </button>

            <h2
              className="text-lg sm:text-xl font-semibold text-gray-800"
              aria-live="polite"
              aria-atomic="true"
            >
              {monthLabel}
            </h2>

            <button
              type="button"
              onClick={handleNextMonth}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-xl text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0caebb]"
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          {/* Weekday labels: 14 columns */}
          <div className="grid grid-cols-[repeat(14,minmax(0,1fr))] text-center text-[10px] sm:text-xs font-medium text-gray-500 mb-2">
            {weekDayLabels.map((day, index) => (
              <div
                key={`${day}-${index}`}
                className="py-1 min-w-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Dates: 14 columns x 3 rows */}
          <div className="grid grid-cols-[repeat(14,minmax(0,1fr))] gap-0.5">
            {monthGrid.map((date) => {
              const key = toDateKey(date);

              const inCurrentMonth =
                date.getMonth() === viewDate.getMonth();

              const hasAnnouncements =
                (byDate.get(key)?.length || 0) > 0;

              const isSelected =
                isSameDay(date, selectedDate);

              const isToday =
                isSameDay(date, today);

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelect(date)}
                  className={[
                    'relative min-w-0 h-8 rounded-md flex items-center justify-center text-[10px] sm:text-xs transition',
                    inCurrentMonth
                      ? 'text-gray-900 hover:bg-gray-100'
                      : 'text-gray-400 hover:bg-gray-50',
                    isSelected
                      ? 'bg-[#0caebb] text-white font-semibold ring-2 ring-[#0caebb]'
                      : '',
                    isToday && !isSelected
                      ? 'border border-[#0caebb] font-semibold'
                      : '',
                  ].join(' ')}
                  aria-pressed={isSelected}
                  aria-current={isToday ? 'date' : undefined}
                  aria-label={`${getMonthLabel(date)} ${date.getDate()}${
                    hasAnnouncements
                      ? `, ${byDate.get(key).length} announcement(s)`
                      : ''
                  }`}
                  title={
                    hasAnnouncements
                      ? `${byDate.get(key).length} announcement(s)`
                      : undefined
                  }
                >
                  {date.getDate()}

                  {hasAnnouncements && (
                    <span
                      className={`absolute bottom-0.5 h-1 w-1 rounded-full ${
                        isSelected
                          ? 'bg-white'
                          : 'bg-[#0caebb]'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Calendar controls */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleToday}
              className="text-xs px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Today
            </button>

            <button
              type="button"
              onClick={handleThisMonth}
              className="text-xs px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              This Month
            </button>
          </div>
        </div>
      </section>

      {/* RIGHT: Announcements - one-third of the width */}
      <aside className="md:col-span-1 min-w-0">
        <div className="bg-white rounded-2xl shadow p-4 h-full">

          {/* Announcements heading */}
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
            <h2 className="text-base font-semibold text-gray-800">
              Announcements
            </h2>

            <span className="text-xs text-gray-500">
              {selectedKey}
            </span>
          </div>

          {/* Announcements for the selected date */}
          {selectedAnnouncements.length === 0 ? (
            <p className="text-sm text-gray-500">
              No announcements for this date.
            </p>
          ) : (
            <ul className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {selectedAnnouncements.map((announcement, index) => (
                <li
                  key={
                    announcement.id ??
                    `${announcement.title}-${announcement.date}-${index}`
                  }
                  className="border border-gray-200 rounded-xl p-3 hover:bg-gray-50"
                >
                  <h3 className="text-sm font-bold text-gray-700">
                    {announcement.title}
                  </h3>

                  {announcement.content && (
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                      {announcement.content}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}