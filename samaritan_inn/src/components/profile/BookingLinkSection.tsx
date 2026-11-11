"use client";

import { useEffect, useState } from "react";
import {
  getOwnCaseworkerView,
  type Caseworker,
} from "@/lib/appointments-data";
import EditableProfileField, {
  editableField,
} from "@/components/appointments/EditableProfileField";

/**
  "Outlook Bookings link" on the Profile tab, for Empowerment Coaches.

  Saves through the same API as the /appointments profile card
  (PATCH /api/caseworkers/me), so both always show and update the same link.
  The first save links or creates the coach's profile automatically, so a
  coach doesn't have to wait for an admin before adding their link.
 */
export default function BookingLinkSection() {
  const [bookingUrl, setBookingUrl] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getOwnCaseworkerView()
      .then((view) => {
        if (cancelled) return;
        setBookingUrl(view.profile?.bookingUrl ?? null);
        setLoaded(true);
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Unable to load your Bookings link."
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-md bg-gray-50 p-4">
      <h2 className="mb-1 text-lg font-medium text-gray-900">Outlook Bookings link</h2>
      <p className="mb-3 text-sm text-gray-600">
        Residents see this link next to your name on the Empowerment Coaches
        page and use it to book with you.
      </p>

      {loadError ? (
        <p className="text-sm text-red-600">{loadError}</p>
      ) : !loaded ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <EditableProfileField
          field={editableField("bookingUrl")}
          value={bookingUrl}
          hideLabel
          onSaved={(profile: Required<Caseworker>) => setBookingUrl(profile.bookingUrl)}
        />
      )}
    </div>
  );
}
