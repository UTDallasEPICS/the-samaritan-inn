"use client";

import type { UpcomingAppointment } from "@/lib/appointments-data";
import PersonRow from "./PersonRow";

/**
 * The shelter operates on US Central time, and the existing booking rules in
 * src/lib/booking.ts already hardcode it. We format in that zone too, so a
 * resident opening the app while travelling still sees the appointment time as
 * the front desk means it.
 */
const TIME_ZONE = "America/Chicago";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: TIME_ZONE,
  });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  });

export default function UpcomingAppointmentRow({
  appointment,
}: {
  appointment: UpcomingAppointment;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-8">
        <PersonRow
          name={appointment.caseworker.name}
          role={appointment.caseworker.role}
          avatarUrl={appointment.caseworker.avatarUrl}
        />

        <div className="space-y-1 text-sm text-gray-600">
          <p className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
              className="h-4 w-4 flex-shrink-0 text-blue-600"
            >
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
            </svg>
            {/* <time> gives the machine-readable date to screen readers and
                crawlers while humans see the friendly version. */}
            <time dateTime={appointment.startTime}>
              {formatDate(appointment.startTime)}
            </time>
          </p>
          <p className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
              className="h-4 w-4 flex-shrink-0 text-blue-600"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" strokeLinecap="round" />
            </svg>
            <span>{formatTime(appointment.startTime)}</span>
          </p>
        </div>
      </div>

      {/* Deliberately disabled: there is no appointment detail screen yet, and a
          button that looks live but silently does nothing is worse than one that
          plainly says it is not ready. Enable this when that screen exists. */}
      <button
        type="button"
        disabled
        title="Appointment details are not built yet"
        className="flex items-center gap-2 self-start font-semibold text-blue-600 disabled:cursor-not-allowed disabled:opacity-60 md:self-auto"
      >
        View Details
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
          className="h-4 w-4"
        >
          <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
