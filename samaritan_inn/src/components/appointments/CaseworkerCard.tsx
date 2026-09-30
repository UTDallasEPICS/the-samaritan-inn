"use client";

import type { Caseworker } from "@/lib/appointments-data";
import PersonRow from "./PersonRow";

/**
 * The bordered card under "My Caseworker(s)": person on the left, contact
 * details on the right.
 *
 * On phones the two halves stack (flex-col) and the details left-align;
 * from the `md` breakpoint up they sit side by side with the details
 * right-aligned, the way the approved design shows them.
 */
export default function CaseworkerCard({ caseworker }: { caseworker: Caseworker }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border-2 border-blue-600 bg-blue-50/40 p-5 md:flex-row md:items-center md:justify-between">
      <PersonRow
        name={caseworker.name}
        role={caseworker.role}
        avatarUrl={caseworker.avatarUrl}
        size="lg"
      />

      <dl className="space-y-1 text-sm text-gray-700 md:text-right">
        <div>
          <dt className="inline font-semibold">Availability: </dt>
          <dd className="inline">{caseworker.availability}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">Email: </dt>
          <dd className="inline">
            <a className="hover:underline" href={`mailto:${caseworker.email}`}>
              {caseworker.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="inline font-semibold">Phone: </dt>
          <dd className="inline">
            <a className="hover:underline" href={`tel:${caseworker.phone}`}>
              {caseworker.phone}
            </a>
          </dd>
        </div>
        <div>
          <dt className="inline font-semibold">Room: </dt>
          <dd className="inline">{caseworker.room}</dd>
        </div>
      </dl>
    </div>
  );
}
