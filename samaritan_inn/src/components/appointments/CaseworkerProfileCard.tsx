"use client";

import type { Caseworker } from "@/lib/appointments-data";
import EditableProfileField, { EDITABLE_FIELDS, FieldLabel } from "./EditableProfileField";
import PersonRow from "./PersonRow";

/**
  The logged-in Empowerment Coach's own profile, exactly as residents see it.

  Every field is drawn as a textbox. Email and room are set by an admin on
  /admin-empowerment-coaches and shown grayed out with a lock. Bookings link,
  availability and phone are white with an Edit button (EditableProfileField):
  each one is edited, checked and saved on its own.
 */

type Profile = Required<Caseworker>;

const LockIcon = () => (
  <svg
    className="h-4 w-4 flex-shrink-0 text-gray-400"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
      clipRule="evenodd"
    />
  </svg>
);

/** Admin-managed field: grayed-out textbox with a lock. */
function LockedField({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div
        className="flex h-11 items-center gap-2 rounded-md border border-gray-200 bg-gray-100 px-3 text-gray-600"
        title="Managed by an admin"
      >
        <span className="min-w-0 flex-1 truncate">
          {value || <span className="text-gray-400">Not set</span>}
        </span>
        <LockIcon />
      </div>
    </div>
  );
}

export default function CaseworkerProfileCard({
  profile,
  onSaved,
}: {
  profile: Profile;
  onSaved: (profile: Profile) => void;
}) {
  return (
    <div className="rounded-lg border-2 border-blue-600 bg-blue-50/40 p-5">
      <PersonRow name={profile.name} title={profile.title} size="lg" />

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <LockedField label="Email" value={profile.email} />
        <LockedField label="Room" value={profile.room} />
      </div>

      <div className="mt-5 grid gap-4 border-t border-blue-200 pt-5 md:grid-cols-2">
        {EDITABLE_FIELDS.map((field) => (
          <EditableProfileField
            key={field.key}
            field={field}
            value={profile[field.key]}
            onSaved={onSaved}
          />
        ))}
      </div>

      {!profile.bookingUrl && (
        <p className="mt-4 rounded border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
          Residents can&apos;t book with you until you add your Outlook /
          Microsoft Bookings link.
        </p>
      )}
    </div>
  );
}
