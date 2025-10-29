// SidebarCalendar.jsx
import React, { useMemo, useState } from "react";

function pad(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

function toDateKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function normalizeISODateOnly(iso) {
  if (typeof iso === "string" && iso.length >= 10) return iso.slice(0, 10);
  return iso;
}

function getDaysInMonth(year, monthIndex0) {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

function getMonthLabel(d) {
  return d.toLocaleString(undefined, { month: "long", year: "numeric" });
}

function addMonths(d, delta) {
  const copy = new Date(d);
  copy.setDate(1);
  copy.setMonth(copy.getMonth() + delta);
  return copy;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Build 6x7 grid starting on Sunday
function buildMonthGrid(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay(); // 0=Sun..6=Sat
  const totalCells = 42;
  const grid = [];
  const startDate = new Date(year, month, 1 - startWeekday);

  for (let i = 0; i < totalCells; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    grid.push(d);
  }
  return grid;
}

export default function SidebarCalendar({
  announcements = [],
  className = "",
  onDateSelect,
}) {
  // Map announcements by "YYYY-MM-DD"
  const byDate = useMemo(() => {
    const m = new Map();
    for (const a of announcements) {
      const key = normalizeISODateOnly(a.date);
      const arr = m.get(key) || [];
      arr.push(a);
      m.set(key, arr);
    }
    return m;
  }, [announcements]);

  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => today);

  const monthGrid = useMemo(() => buildMonthGrid(viewDate), [viewDate]);
  const selectedKey = toDateKey(selectedDate);
  const selectedAnnouncements = useMemo(
    () => byDate.get(selectedKey) || [],
    [byDate, selectedKey]
  );

  const monthLabel = useMemo(() => getMonthLabel(viewDate), [viewDate]);
  const weekDayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentMonth = viewDate.getMonth();

  function handleSelect(d) {
    setSelectedDate(d);
    if (typeof onDateSelect === "function") onDateSelect(toDateKey(d));
  }

  return (
    <aside className={`w-full lg:w-80 2xl:w-96 ${className}`}>
      {/* Calendar */}
      <div className="bg-white rounded-2xl shadow p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={() => setViewDate((d) => addMonths(d, -1))}
            className="px-3 py-2 rounded-xl hover:bg-gray-100 focus:outline-none"
            aria-label="Previous month"
          >
            ‹
          </button>
          <div className="text-lg font-semibold">{monthLabel}</div>
          <button
            type="button"
            onClick={() => setViewDate((d) => addMonths(d, 1))}
            className="px-3 py-2 rounded-xl hover:bg-gray-100 focus:outline-none"
            aria-label="Next month"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500 mb-1">
          {weekDayLabels.map((w) => (
            <div key={w} className="py-1">
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {monthGrid.map((d, idx) => {
            const inCurrentMonth = d.getMonth() === currentMonth;
            const key = toDateKey(d);
            const hasAnnouncements = (byDate.get(key)?.length || 0) > 0;
            const isSelected = isSameDay(d, selectedDate);
            const isToday = isSameDay(d, today);

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(d)}
                className={[
                  "relative h-10 rounded-xl flex items-center justify-center text-sm transition",
                  inCurrentMonth
                    ? "text-gray-900 hover:bg-gray-100"
                    : "text-gray-400 hover:bg-gray-100",
                  isSelected ? "ring-2 ring-black font-semibold" : "",
                  isToday && !isSelected ? "border border-gray-300" : "",
                ].join(" ")}
                aria-pressed={isSelected}
                aria-current={isToday ? "date" : undefined}
              >
                {d.getDate()}
                {hasAnnouncements && (
                  <span
                    className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-black"
                    aria-hidden="true"
                    title={`${byDate.get(key)?.length} announcement(s)`}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => {
              const t = new Date();
              setViewDate(new Date(t.getFullYear(), t.getMonth(), 1));
              handleSelect(t);
            }}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setViewDate((d) => addMonths(d, 0))}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            This Month
          </button>
        </div>
      </div>

      {/* Announcements */}
      <div className="bg-white rounded-2xl shadow p-4">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-base font-semibold">Announcements</h2>
          <span className="text-xs text-gray-500">{selectedKey}</span>
        </div>

        {selectedAnnouncements.length === 0 ? (
          <p className="text-sm text-gray-500">No announcements for this date.</p>
        ) : (
          <ul className="space-y-3 max-h-80 overflow-auto pr-1">
            {selectedAnnouncements
              .slice()
              .sort((a, b) =>
                normalizeISODateOnly(a.date).localeCompare(
                  normalizeISODateOnly(b.date)
                )
              )
              .map((a) => (
                <li
                  key={a.id ?? `${a.title}-${a.date}`}
                  className="border border-gray-200 rounded-xl p-3 hover:bg-gray-50"
                >
                  <div className="text-sm font-medium">{a.title}</div>
                  {a.content ? (
                    <p className="text-sm text-gray-600 mt-1">{a.content}</p>
                  ) : null}
                </li>
              ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
