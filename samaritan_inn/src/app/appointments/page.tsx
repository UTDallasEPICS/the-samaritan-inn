"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import CaseworkerCard from "@/components/appointments/CaseworkerCard";
import PersonRow from "@/components/appointments/PersonRow";
import UpcomingAppointmentRow from "@/components/appointments/UpcomingAppointmentRow";
import {
  getCaseworkerData,
  getUpcomingAppointments,
  type CaseworkerData,
  type UpcomingAppointment,
} from "@/lib/appointments-data";

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
  const { status } = useSession();
  const router = useRouter();

  // ── Caseworker data (from Salesforce, via /api/caseworkers) ──
  const [caseworkerData, setCaseworkerData] = useState<CaseworkerData | null>(null);
  const [caseworkerError, setCaseworkerError] = useState<string | null>(null);

  // ── Appointments (from our database, via /api/my-events) ──
  const [upcoming, setUpcoming] = useState<UpcomingAppointment[] | null>(null);
  const [upcomingError, setUpcomingError] = useState<string | null>(null);

  // ── Dropdown state ──
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Residents only: send logged-out visitors away, same as the Classes page.
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/unauthorized");
    }
  }, [status, router]);

  const loadUpcoming = useCallback(async () => {
    try {
      setUpcoming(await getUpcomingAppointments());
      setUpcomingError(null);
    } catch (error) {
      setUpcomingError(
        error instanceof Error ? error.message : "Unable to load your appointments."
      );
    }
  }, []);

  // Load both data sources once the session is confirmed. They load
  // independently, so if Salesforce is down the resident still sees their
  // appointments (which live in our database).
  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;

    getCaseworkerData()
      .then((data) => {
        if (!cancelled) setCaseworkerData(data);
      })
      .catch((error) => {
        if (!cancelled) {
          setCaseworkerError(
            error instanceof Error
              ? error.message
              : "Unable to load caseworker information."
          );
        }
      });

    getUpcomingAppointments()
      .then((appts) => {
        if (!cancelled) setUpcoming(appts);
      })
      .catch((error) => {
        if (!cancelled) {
          setUpcomingError(
            error instanceof Error ? error.message : "Unable to load your appointments."
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

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

  // Don't flash resident-only content while the session is being checked or
  // while redirecting a logged-out visitor.
  if (status !== "authenticated") return null;

  const bookable = caseworkerData?.bookableCaseworkers ?? [];
  const selected = bookable.find((cw) => cw.id === selectedId) ?? null;

  const handleSchedule = () => {
    if (!selected) return;
    router.push(
      `/appointments/calendar-form?ownerId=${encodeURIComponent(selected.id)}`
    );
  };

  const caseworkersLoading = !caseworkerData && !caseworkerError;

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

          {/* ── My Caseworker(s) ── */}
          <Card title="My Caseworker(s)">
            {caseworkersLoading ? (
              <p className="text-gray-500">Loading your caseworker…</p>
            ) : caseworkerError ? (
              <p className="text-red-600">{caseworkerError}</p>
            ) : caseworkerData!.myCaseworkers.length === 0 ? (
              <p className="text-gray-500">
                You don&apos;t have a caseworker assigned yet. Please check with
                the front desk.
              </p>
            ) : (
              <div className="space-y-3">
                {caseworkerData!.myCaseworkers.map((cw) => (
                  <CaseworkerCard
                    key={cw.id}
                    caseworker={cw}
                    bookingHours={caseworkerData!.bookingHours}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* ── Schedule an Appointment ── */}
          <Card title="Schedule an Appointment">
            <p id="caseworker-label" className="mb-2 font-semibold text-blue-600">
              Who would you like to meet with?
            </p>

            {caseworkersLoading ? (
              <p className="text-gray-500">Loading caseworkers…</p>
            ) : caseworkerError ? (
              <p className="text-red-600">
                Booking is unavailable while caseworker information can&apos;t
                be loaded. Please try again later.
              </p>
            ) : bookable.length === 0 ? (
              <p className="text-gray-500">
                No caseworkers are available to book right now. Please check
                with the front desk.
              </p>
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
                            onClick={() => {
                              setSelectedId(cw.id);
                              setIsOpen(false);
                            }}
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
                    they picked the right one before continuing. */}
                {selected && (
                  <div className="mt-3 rounded-lg bg-gray-100 p-3">
                    <PersonRow name={selected.name} title={selected.title} />
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
              </>
            )}
          </Card>

          {/* ── Upcoming Appointments ── */}
          <Card title="Upcoming Appointments">
            {upcomingError ? (
              <p className="text-red-600">{upcomingError}</p>
            ) : upcoming === null ? (
              <p className="text-gray-500">Loading your appointments…</p>
            ) : upcoming.length === 0 ? (
              <p className="text-gray-500">
                You have no upcoming appointments. Schedule one above.
              </p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((appt) => (
                  <UpcomingAppointmentRow
                    key={appt.id}
                    appointment={appt}
                    onCancelled={loadUpcoming}
                  />
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
