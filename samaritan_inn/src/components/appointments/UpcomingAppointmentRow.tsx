"use client";

import { useState } from "react";
import {
  cancelAppointment,
  type UpcomingAppointment,
} from "@/lib/appointments-data";
import PersonRow from "./PersonRow";

/**
 * The shelter operates on US Central time, and the booking rules in
 * src/lib/booking.ts use it too, so a resident whose device is set to another
 * time zone still sees the time the front desk means.
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

const durationMinutes = (startIso: string, endIso: string) =>
  Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000);

export default function UpcomingAppointmentRow({
  appointment,
  onCancelled,
}: {
  appointment: UpcomingAppointment;
  /** Called after a successful cancel so the parent can refresh its list. */
  onCancelled: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const detailsId = `appointment-details-${appointment.id}`;

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelAppointment(appointment.id);
      onCancelled();
    } catch (error) {
      setCancelError(
        error instanceof Error ? error.message : "Unable to cancel this appointment."
      );
      setCancelling(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-8">
          {appointment.caseWorker ? (
            <PersonRow
              name={appointment.caseWorker}
              title={appointment.caseWorkerTitle}
            />
          ) : (
            <p className="text-sm text-gray-500">
              Caseworker details are unavailable right now.
            </p>
          )}

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
              <span>
                {formatTime(appointment.startTime)} –{" "}
                {formatTime(appointment.endTime)}
              </span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowDetails((prev) => !prev)}
          aria-expanded={showDetails}
          aria-controls={detailsId}
          className="flex items-center gap-2 self-start font-semibold text-blue-600 hover:underline md:self-auto"
        >
          {showDetails ? "Hide Details" : "View Details"}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
            className={`h-4 w-4 transition-transform ${showDetails ? "rotate-90" : ""}`}
          >
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {showDetails && (
        <div id={detailsId} className="mt-4 border-t border-gray-200 pt-4">
          <dl className="space-y-1 text-sm text-gray-700">
            <div>
              <dt className="inline font-semibold">Reason: </dt>
              <dd className="inline">{appointment.title}</dd>
            </div>
            {appointment.description && (
              <div>
                <dt className="inline font-semibold">Notes: </dt>
                <dd className="inline">{appointment.description}</dd>
              </div>
            )}
            <div>
              <dt className="inline font-semibold">Length: </dt>
              <dd className="inline">
                {durationMinutes(appointment.startTime, appointment.endTime)} minutes
              </dd>
            </div>
          </dl>

          <div className="mt-4">
            {confirmingCancel ? (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-gray-700">
                  Cancel this appointment?
                </span>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="rounded bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {cancelling ? "Cancelling…" : "Yes, cancel it"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingCancel(false)}
                  disabled={cancelling}
                  className="rounded bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300"
                >
                  Keep it
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingCancel(true)}
                className="text-sm font-semibold text-red-600 hover:underline"
              >
                Cancel appointment
              </button>
            )}
            {cancelError && (
              <p role="alert" className="mt-2 text-sm text-red-600">
                {cancelError}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
