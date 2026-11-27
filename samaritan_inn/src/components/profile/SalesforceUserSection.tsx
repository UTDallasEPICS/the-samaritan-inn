"use client";

import { useEffect, useState, type FormEvent } from "react";

async function responseError(response: Response, fallback: string) {
  try {
    const body = await response.json();
    return typeof body?.error === "string" ? body.error : fallback;
  } catch {
    return fallback;
  }
}

export default function SalesforceUserSection() {
  const [username, setUsername] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/users/me")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            await responseError(response, "Unable to load your Salesforce username.")
          );
        }
        return response.json();
      })
      .then((profile) => {
        if (!cancelled) {
          setUsername(profile.salesforceUsername ?? null);
          setLoaded(true);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load your Salesforce username."
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const startEdit = () => {
    setDraft(username ?? "");
    setSaveError(null);
    setSaved(false);
    setEditing(true);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salesforceUsername: draft }),
      });
      if (!response.ok) {
        throw new Error(
          await responseError(response, "Unable to save your Salesforce username.")
        );
      }
      const profile = await response.json();
      setUsername(profile.salesforceUsername ?? null);
      setEditing(false);
      setSaved(true);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Unable to save your Salesforce username."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-md bg-gray-50 p-4">
      <h2 className="mb-1 text-lg font-medium text-gray-900">Salesforce username</h2>
      <p className="mb-3 text-sm text-gray-600">
        Enter the username associated with your Salesforce account.
      </p>

      {loadError ? (
        <p className="text-sm text-red-600">{loadError}</p>
      ) : !loaded ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : editing ? (
        <form onSubmit={save}>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                if (saveError) setSaveError(null);
              }}
              maxLength={255}
              autoFocus
              aria-label="Salesforce username"
              aria-invalid={saveError ? true : undefined}
              className={`h-11 min-w-0 flex-1 rounded-md border bg-white px-3 text-black outline-none focus:ring-2 ${
                saveError
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
                {saving ? "Checking Salesforce…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setSaveError(null);
                }}
                disabled={saving}
                className="h-11 rounded-md border border-gray-300 bg-white px-4 text-black hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
          {saveError && <p className="mt-1 text-sm text-red-600">{saveError}</p>}
        </form>
      ) : (
        <div className="flex gap-2">
          <div className="flex h-11 min-w-0 flex-1 items-center rounded-md border border-gray-300 bg-white px-3 text-black">
            <span className="min-w-0 flex-1 truncate">
              {username || <span className="text-gray-400">Not set</span>}
            </span>
          </div>
          <button
            type="button"
            onClick={startEdit}
            className="h-11 flex-shrink-0 rounded-md border border-blue-600 bg-white px-3 font-semibold text-blue-600 hover:bg-blue-50"
          >
            Edit
          </button>
        </div>
      )}
      {saved && (
        <p role="status" className="mt-1 text-sm font-semibold text-green-700">
          Salesforce username saved.
        </p>
      )}
    </div>
  );
}
