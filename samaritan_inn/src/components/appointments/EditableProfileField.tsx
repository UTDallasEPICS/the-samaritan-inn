"use client";

import React, { useEffect, useState } from "react";
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

/**
  One coach-editable profile field: a white textbox with its own
  Edit / Save / Cancel. Used on the /appointments profile card and on the
  Profile tab; both save through PATCH /api/caseworkers/me, so they always
  update the same stored value.

  Each value is checked with the same rules the server uses
  (src/lib/caseworker-fields.ts) before it is sent, and a short "Saved"
  message confirms a successful save.
 */

type Profile = Required<Caseworker>;
type EditableKey = keyof CaseworkerSelfEdit;

/** How long the "Saved" confirmation stays visible. */
const SAVED_MESSAGE_MS = 3000;

export const EDITABLE_FIELDS: {
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
    label: "Outlook / Microsoft Bookings link",
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

/** Looks up one field's config, e.g. editableField("bookingUrl"). */
export function editableField(key: EditableKey) {
  return EDITABLE_FIELDS.find((field) => field.key === key)!;
}

const PencilIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

/** Shared label above every field. */
export function FieldLabel({
  htmlFor,
  hidden = false,
  children,
}: {
  htmlFor?: string;
  /** Keeps the label for screen readers only, when a heading already names the field. */
  hidden?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={
        hidden
          ? "sr-only"
          : "mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600"
      }
    >
      {children}
    </label>
  );
}

/** Caseworker-editable field: white textbox with its own Edit / Save / Cancel. */
export default function EditableProfileField({
  field,
  value,
  onSaved,
  hideLabel = false,
}: {
  field: (typeof EDITABLE_FIELDS)[number];
  value: string | null;
  onSaved: (profile: Profile) => void;
  /** Hide the visible label when the surrounding section's heading already names the field. */
  hideLabel?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const inputId = `caseworker-${field.key}`;

  // Hide the "Saved" confirmation after a few seconds.
  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setSaved(false), SAVED_MESSAGE_MS);
    return () => clearTimeout(timer);
  }, [saved]);

  const startEdit = () => {
    setDraft(value ?? "");
    setError(null);
    setSaved(false);
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
      setSaved(true);
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
      <FieldLabel htmlFor={editing ? inputId : undefined} hidden={hideLabel}>
        {field.label}
      </FieldLabel>

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

      <p
        role="status"
        aria-live="polite"
        className={`text-sm font-semibold text-green-700 ${saved ? "mt-1" : ""}`}
      >
        {saved && `${field.label} saved.`}
      </p>
    </div>
  );
}
