"use client";

import type { Caseworker } from "@/lib/appointments-data";
import PersonRow from "./PersonRow";

/**
 * The bordered card under "My Caseworker(s)": person on the left, contact
 * details on the right (stacked on phones).
 *
 * Each detail row only renders when that value exists, so a caseworker with no
 * phone on file shows no "Phone:" line rather than a blank one.
 */
export default function CaseworkerCard({
  caseworker,
  bookingHours,
}: {
  caseworker: Caseworker;
  bookingHours: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border-2 border-blue-600 bg-blue-50/40 p-5 md:flex-row md:items-center md:justify-between">
      <PersonRow name={caseworker.name} title={caseworker.title} size="lg" />

      <dl className="space-y-1 text-sm text-gray-700 md:text-right">
        <div>
          <dt className="inline font-semibold">Booking hours: </dt>
          <dd className="inline">{bookingHours}</dd>
        </div>
        {caseworker.email && (
          <div>
            <dt className="inline font-semibold">Email: </dt>
            <dd className="inline">
              <a className="hover:underline" href={`mailto:${caseworker.email}`}>
                {caseworker.email}
              </a>
            </dd>
          </div>
        )}
        {caseworker.phone && (
          <div>
            <dt className="inline font-semibold">Phone: </dt>
            <dd className="inline">
              <a className="hover:underline" href={`tel:${caseworker.phone}`}>
                {caseworker.phone}
              </a>
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
