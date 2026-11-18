"use client";

import React, { useEffect, useState } from "react";
import { checkCalendlyUrl } from "@/lib/settings/calendly-url";

/**
  Admin-only control at the top of /classes for the Calendly link residents
  book classes through. The link is hidden behind asterisks, like a password,
  until the admin clicks Edit; then it's shown in an editable box with
  Save / Cancel. The link is checked with the same rule the server uses
  (src/lib/calendly-url.ts) before it's sent.
 */

/** Fixed length, so the mask doesn't reveal how long the link is. */
const MASK = "*".repeat(24);

/** How long the "saved" confirmation stays visible. */
const SAVED_MESSAGE_MS = 3000;

async function readError(res: Response, fallback: string) {
  try {
    const body = await res.json();
    return typeof body?.error === "string" ? body.error : fallback;
  } catch {
    return fallback;
  }
}

export default function CalendlyLinkSetting({
  url,
  onSaved,
}: {
  url: string;
  onSaved: (url: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Hide the "saved" confirmation after a few seconds.
  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setSaved(false), SAVED_MESSAGE_MS);
    return () => clearTimeout(timer);
  }, [saved]);

  const startEdit = () => {
    setDraft(url);
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
    const checked = checkCalendlyUrl(draft);
    if ("error" in checked) {
      setError(checked.error);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/classes/calendly", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: checked.value }),
      });
      if (!res.ok) throw new Error(await readError(res, "Unable to save the Calendly link."));
      const body: { url: string } = await res.json();
      onSaved(body.url);
      setEditing(false);
      setSaved(true);
    } catch (err) {
      // The server re-checks the link; show its message if it disagrees.
      setError(err instanceof Error ? err.message : "Unable to save the Calendly link.");
    } finally {
      setSaving(false);
    }
  };

  const box = "h-11 rounded-md border bg-white px-3 text-black";

  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
      <label
        htmlFor={editing ? "calendly-url" : undefined}
        className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600"
      >
        Calendly link <span className="normal-case font-normal text-gray-500">(only admins see this)</span>
      </label>

      {editing ? (
        <form onSubmit={save} noValidate>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="calendly-url"
              type="url"
              value={draft}
              placeholder="https://calendly.com/your-name/event"
              autoFocus
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "calendly-url-error" : undefined}
              onChange={(e) => {
                setDraft(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") cancel();
              }}
              className={`${box} min-w-0 flex-1 outline-none focus:ring-2 ${
                error ? "border-red-500 focus:ring-red-200" : "border-blue-600 focus:ring-blue-200"
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
            <p id="calendly-url-error" className="mt-1 text-sm text-red-600">
              {error}
            </p>
          )}
        </form>
      ) : (
        <div className="flex gap-2">
          <div
            className={`${box} flex min-w-0 flex-1 items-center border-gray-300 font-mono tracking-widest text-gray-500`}
            aria-label="Calendly link (hidden)"
          >
            {MASK}
          </div>
          <button
            type="button"
            onClick={startEdit}
            className="h-11 flex-shrink-0 rounded-md border border-blue-600 bg-white px-4 font-semibold text-blue-600 hover:bg-blue-50"
          >
            Edit
          </button>
        </div>
      )}

      <p
        role="status"
        aria-live="polite"
        className={`text-sm font-semibold text-green-700 ${saved ? "mt-1" : ""}`}
      >
        {saved && "Calendly link saved. The calendar below now uses it."}
      </p>
    </div>
  );
}
