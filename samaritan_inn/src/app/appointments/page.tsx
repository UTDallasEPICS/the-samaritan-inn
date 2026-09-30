"use client";

import React, { useState, useRef, useEffect } from "react";
import Navigation from "@/components/Navigation";
import CaseworkerCard from "@/components/appointments/CaseworkerCard";
import PersonRow from "@/components/appointments/PersonRow";
import UpcomingAppointmentRow from "@/components/appointments/UpcomingAppointmentRow";
import {
  getMyCaseworkers,
  getBookableCaseworkers,
  getUpcomingAppointments,
  type Caseworker,
  type UpcomingAppointment,
} from "@/lib/appointments-data";

// TODO(auth): this page is currently readable without logging in, matching the
// old /my-events page. src/app/schedule/page.tsx shows the redirect pattern
// (useSession -> router.push("/unauthorized")). Add it once real resident data
// is displayed here.

/** Small reusable wrapper so every section is the same white rounded card. */
function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="w-full rounded-lg bg-white p-6 shadow-md">
      {title && (
        <h2 className="mb-4 text-2xl font-bold text-black">{title}</h2>
      )}
      {children}
    </section>
  );
}

const AppointmentsPage = () => {
  // ── Data loaded from the (currently mocked) data layer ──
  const [myCaseworkers, setMyCaseworkers] = useState<Caseworker[]>([]);
  const [bookable, setBookable] = useState<Caseworker[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // ── Dropdown state ──
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scheduleNotice, setScheduleNotice] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch everything once, when the page first appears. Promise.all runs the
  // three requests at the same time rather than waiting for each in turn.
  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getMyCaseworkers(),
      getBookableCaseworkers(),
      getUpcomingAppointments(),
    ])
      .then(([mine, all, appts]) => {
        // If the user navigated away before this resolved, don't touch state.
        if (cancelled) return;
        setMyCaseworkers(mine);
        setBookable(all);
        setUpcoming(appts);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Close the dropdown on an outside click or the Escape key.
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const selected = bookable.find((cw) => cw.id === selectedId) ?? null;

  const handleSelect = (caseworker: Caseworker) => {
    setSelectedId(caseworker.id);
    setIsOpen(false);
    setScheduleNotice(null);
  };

  const handleSchedule = () => {
    // No booking backend yet, and the approved design has no date/time picker,
    // so say so out loud instead of failing silently.
    setScheduleNotice(
      "Booking isn't connected yet — picking a date and time is the next step.",
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />

      {/* One gray page area; the cards stack inside it with even spacing. */}
      <main className="flex-grow bg-gray-100 px-4 py-6">
        <div className="mx-auto w-full max-w-4xl space-y-4">
          {/* ── Page header ── */}
          <Card>
            <h1 className="text-center text-3xl font-bold text-black">
              My Appointments
            </h1>
            <p className="mt-1 text-center text-gray-500">
              Schedule a meeting with someone on your support team.
            </p>
          </Card>

          {loadError && (
            <Card>
              <p className="text-red-600">
                We couldn&apos;t load your appointment information. Please
                refresh the page or try again later.
              </p>
            </Card>
          )}

          {/* ── My Caseworker(s) ── */}
          <Card title="My Caseworker(s)">
            {loading ? (
              <p className="text-gray-500">Loading your caseworker…</p>
            ) : myCaseworkers.length === 0 ? (
              <p className="text-gray-500">
                You don&apos;t have a caseworker assigned yet. Please check with
                the front desk.
              </p>
            ) : (
              <div className="space-y-3">
                {myCaseworkers.map((cw) => (
                  <CaseworkerCard key={cw.id} caseworker={cw} />
                ))}
              </div>
            )}
          </Card>

          {/* ── Schedule an Appointment ── */}
          <Card title="Schedule an Appointment">
            <p id="caseworker-label" className="mb-2 font-semibold text-blue-600">
              Who would you like to meet with?
            </p>

            {loading ? (
              <p className="text-gray-500">Loading caseworkers…</p>
            ) : (
              <>
                <div ref={dropdownRef} className="relative w-full">
                  <button
                    type="button"
                    onClick={() => setIsOpen((prev) => !prev)}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    aria-labelledby="caseworker-label"
                    className="flex h-12 w-full items-center justify-between rounded border border-gray-300 px-4 text-left text-black hover:bg-gray-50"
                  >
                    <span className={selected ? "" : "text-gray-500"}>
                      {selected ? selected.name : "Choose a case worker"}
                    </span>
                    <svg
                      className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {isOpen && (
                    <ul
                      role="listbox"
                      aria-labelledby="caseworker-label"
                      // absolute + z-10 floats the list over the content below
                      // instead of pushing the rest of the card down.
                      className="absolute z-10 mt-1 w-full overflow-hidden rounded border border-gray-300 bg-white shadow-lg"
                    >
                      {bookable.map((cw) => (
                        <li key={cw.id} role="option" aria-selected={cw.id === selectedId}>
                          <button
                            type="button"
                            onClick={() => handleSelect(cw)}
                            className="block w-full px-4 py-2 text-left text-black hover:bg-gray-100"
                          >
                            {cw.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* The chosen person, echoed back so the resident can confirm
                    they picked the right one before committing. */}
                {selected && (
                  <div className="mt-3 rounded-lg bg-gray-100 p-3">
                    <PersonRow
                      name={selected.name}
                      role={selected.role}
                      avatarUrl={selected.avatarUrl}
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSchedule}
                  disabled={!selected}
                  className="mt-3 w-full rounded bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  Schedule Appointment
                </button>

                {!selected && (
                  <p className="mt-2 text-sm text-gray-500">
                    Choose a case worker above to continue.
                  </p>
                )}

                {scheduleNotice && (
                  <p role="status" className="mt-2 text-sm text-gray-600">
                    {scheduleNotice}
                  </p>
                )}
              </>
            )}
          </Card>

          {/* ── Upcoming Appointments ── */}
          <Card title="Upcoming Appointments">
            {loading ? (
              <p className="text-gray-500">Loading your appointments…</p>
            ) : upcoming.length === 0 ? (
              <p className="text-gray-500">
                You have no upcoming appointments. Schedule one above.
              </p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((appt) => (
                  <UpcomingAppointmentRow key={appt.id} appointment={appt} />
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AppointmentsPage;
