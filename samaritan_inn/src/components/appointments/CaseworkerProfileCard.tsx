"use client";

import React, { useState } from "react";
import {
  updateOwnCaseworkerProfile,
  type Caseworker,
  type CaseworkerSelfEdit,
} from "@/lib/appointments-data";
import {
  FIELD_MAX_LENGTH,
  checkAvailability,
  checkBookingUrl,
  checkPhone,
} from "@/lib/caseworker-fields";
import PersonRow from "./PersonRow";

/**
  The logged-in caseworker's own profile, exactly as residents see it.

  Every field is drawn as a textbox. Email and room are set by an admin on
  /admin-caseworkers and shown grayed out with a lock. Bookings link,
  availability and phone are white with an Edit button: each one is edited
  and saved on its own, and checked with the same rules the server uses
  (src/lib/caseworker-fields.ts) before it is sent.
 */

type Profile = Required<Caseworker>;
type EditableKey = keyof CaseworkerSelfEdit;

const EDITABLE: {
  key: EditableKey;
  label: string;
  placeholder: string;
  type: string;
  /** Returns an error message, or null when the value can be saved. */
  validate: (value: string) => string | null;
  wide?: boolean;
}[] = [
  {
    key: "bookingUrl",
    label: "Microsoft Bookings link",
    placeholder: "https://bookings.cloud.microsoft/book/...",
    type: "url",
    validate: (value) => {
      const result = checkBookingUrl(value);
      return "error" in result ? result.error : null;
    },
    wide: true,
  },
  {
    key: "availability",
    label: "Availability",
    placeholder: "Mon–Fri, 9:00 AM – 5:00 PM",
    type: "text",
    validate: checkAvailability,
  },
  {
    key: "phone",
    label: "Phone",
    placeholder: "(214) 555-0100",
    type: "tel",
    validate: checkPhone,
  },
];

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

const PencilIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

/** Shared label above every field. */
function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600"
    >
      {children}
    </label>
  );
}

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

/** Caseworker-editable field: white textbox with its own Edit / Save / Cancel. */
function EditableField({
  field,
  value,
  onSaved,
}: {
  field: (typeof EDITABLE)[number];
  value: string | null;
  onSaved: (profile: Profile) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const inputId = `caseworker-${field.key}`;

  const startEdit = () => {
    setDraft(value ?? "");
    setError(null);
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setError(null);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const problem = field.validate(draft);
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      onSaved(await updateOwnCaseworkerProfile({ [field.key]: draft }));
      setEditing(false);
    } catch (err) {
      // The server re-checks every value; show its message if it disagrees.
      setError(err instanceof Error ? err.message : "Unable to save.");
    } finally {
      setSaving(false);
    }
  };

  const box = "h-11 rounded-md border bg-white px-3 text-black";

  return (
    <div className={field.wide ? "md:col-span-2" : ""}>
      <FieldLabel htmlFor={editing ? inputId : undefined}>{field.label}</FieldLabel>

      {editing ? (
        <form onSubmit={save} noValidate>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id={inputId}
              type={field.type}
              value={draft}
              placeholder={field.placeholder}
              maxLength={FIELD_MAX_LENGTH[field.key]}
              autoFocus
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${inputId}-error` : undefined}
              onChange={(e) => {
                setDraft(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") cancel();
              }}
              className={`${box} min-w-0 flex-1 outline-none focus:ring-2 ${
                error
                  ? "border-red-500 focus:ring-red-200"
                  : "border-blue-600 focus:ring-blue-200"
              }`}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="h-11 rounded-md bg-blue-600 px-4 font-bold text-white hover:bg-blue-700 disabled:bg-gray-300"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={cancel}
                disabled={saving}
                className="h-11 rounded-md border border-gray-300 bg-white px-4 text-black hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
          {error && (
            <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
              {error}
            </p>
          )}
        </form>
      ) : (
        <div className="flex gap-2">
          <div className={`${box} flex min-w-0 flex-1 items-center border-gray-300`}>
            <span className="min-w-0 flex-1 truncate">
              {!value ? (
                <span className="text-gray-400">Not set</span>
              ) : field.key === "bookingUrl" ? (
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                  title={value}
                >
                  {value}
                </a>
              ) : (
                value
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={startEdit}
            aria-label={`Edit ${field.label}`}
            className="flex h-11 flex-shrink-0 items-center gap-1 rounded-md border border-blue-600 bg-white px-3 font-semibold text-blue-600 hover:bg-blue-50"
          >
            <PencilIcon />
            Edit
          </button>
        </div>
      )}
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
        {EDITABLE.map((field) => (
          <EditableField
            key={field.key}
            field={field}
            value={profile[field.key]}
            onSaved={onSaved}
          />
        ))}
      </div>

      {!profile.bookingUrl && (
        <p className="mt-4 rounded border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
          Residents can&apos;t book with you until you add your Microsoft
          Bookings link.
        </p>
      )}
    </div>
  );
}
