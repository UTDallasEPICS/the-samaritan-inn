"use client";

import Link from "next/link";
import type { AssignedResident } from "@/lib/appointments-data";
import PersonRow from "./PersonRow";

/**
  The residents assigned to the logged-in caseworker. Room and employment come
  from each resident's latest work schedule, so they read "Unknown" until
  the resident submits one.
 */

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(iso: string | null) {
  return iso ? dateFormat.format(new Date(iso)) : null;
}

function employment(resident: AssignedResident) {
  if (resident.employmentStatus === "EMPLOYED") {
    return resident.employerName
      ? `Employed at ${resident.employerName}`
      : "Employed";
  }
  if (resident.employmentStatus === "UNEMPLOYED") return "Unemployed";
  return null;
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="inline font-semibold">{label}: </dt>
      <dd className="inline">
        {value ?? <span className="text-gray-400">Unknown</span>}
      </dd>
    </div>
  );
}

export default function AssignedResidentsList({
  residents,
}: {
  residents: AssignedResident[];
}) {
  if (residents.length === 0) {
    return (
      <p className="text-gray-500">
        No residents are assigned to you yet. An admin assigns residents on the
        Manage Caseworkers page.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {residents.map((resident) => (
        <li
          key={resident.id}
          className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 md:flex-row md:justify-between"
        >
          <div className="min-w-0">
            <PersonRow name={resident.name} title={null} />
            <a
              href={`mailto:${resident.email}`}
              className="mt-1 block break-all text-sm text-blue-600 hover:underline"
            >
              {resident.email}
            </a>
            {resident.pendingRequests > 0 && (
              <Link
                href="/admin-forms"
                className="mt-2 inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800 hover:bg-yellow-200"
              >
                {resident.pendingRequests} pending request
                {resident.pendingRequests === 1 ? "" : "s"} →
              </Link>
            )}
          </div>

          <dl className="space-y-1 text-sm text-gray-700 md:text-right">
            <Detail label="Room" value={resident.room} />
            <Detail label="Employment" value={employment(resident)} />
            <Detail label="Assigned to you" value={formatDate(resident.assignedAt)} />
            <Detail label="Member since" value={formatDate(resident.joinedAt)} />
          </dl>
        </li>
      ))}
    </ul>
  );
}
