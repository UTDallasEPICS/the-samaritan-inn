"use client";

import type React from "react";
import type { Caseworker } from "@/lib/appointments-data";
import PersonRow from "./PersonRow";

/***
  One Empowerment Coach's bordered card on /empowerment-coaches: person on the
  left, contact details on the right (stacked on phones), and an optional
  action (the Book button) underneath.
 
  Each detail row only renders when that value exists, so a coach with no
  phone on file shows no "Phone:" line rather than a blank one.
 */
export default function CaseworkerCard({
  caseworker,
  bookingHours,
  children,
}: {
  caseworker: Caseworker;
  bookingHours: string;
  /** Shown under the details, e.g. the Book button. */
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border-2 border-blue-600 bg-blue-50/40 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PersonRow name={caseworker.name} title={caseworker.title} size="lg" />

        <dl className="space-y-1 text-sm text-gray-700 md:text-right">
          {/* Directory caseworkers list their own hours; Salesforce ones share the app-wide booking hours. */}
          {caseworker.availability ? (
            <div>
              <dt className="inline font-semibold">Availability: </dt>
              <dd className="inline">{caseworker.availability}</dd>
            </div>
          ) : (
            bookingHours && (
              <div>
                <dt className="inline font-semibold">Booking hours: </dt>
                <dd className="inline">{bookingHours}</dd>
              </div>
            )
          )}
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
          {caseworker.room && (
            <div>
              <dt className="inline font-semibold">Room: </dt>
              <dd className="inline">{caseworker.room}</dd>
            </div>
          )}
        </dl>
      </div>
      {children && <div className="mt-4 border-t border-blue-200 pt-4">{children}</div>}
    </div>
  );
}
