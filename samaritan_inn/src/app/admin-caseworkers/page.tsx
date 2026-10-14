"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";

/**
 * Admin-only caseworker directory (used when CASEWORKER_SOURCE="local").
 * Staff add caseworkers with their contact details and Microsoft Bookings link,
 * then assign residents to them. Residents see their assigned caseworkers on
 * /appointments and book through the Bookings link.
 */

type DirectoryCaseworker = {
  id: string;
  name: string;
  title: string | null;
  email: string;
  phone: string | null;
  room: string | null;
  availability: string | null;
  bookingUrl: string | null;
};

type Person = { id: string; name: string; email: string };

type Assignment = { id: string; caseworkerEmail: string; resident: Person };

type DirectoryData = {
  source: "local" | "salesforce";
  caseworkers: DirectoryCaseworker[];
  assignments: Assignment[];
  residents: Person[];
};

type FormFields = Omit<DirectoryCaseworker, "id">;

const EMPTY_FORM: Record<keyof FormFields, string> = {
  name: "",
  title: "",
  email: "",
  phone: "",
  room: "",
  availability: "",
  bookingUrl: "",
};

const FIELDS: {
  key: keyof FormFields;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}[] = [
  { key: "name", label: "Name", required: true },
  { key: "email", label: "Email", required: true, type: "email" },
  { key: "title", label: "Title", placeholder: "Case Worker" },
  { key: "phone", label: "Phone", type: "tel" },
  { key: "room", label: "Room", placeholder: "Office B-204" },
  {
    key: "availability",
    label: "Availability",
    placeholder: "Mon–Fri, 9:00 AM – 5:00 PM",
  },
  {
    key: "bookingUrl",
    label: "Microsoft Bookings link",
    placeholder: "https://bookings.cloud.microsoft/book/...",
    type: "url",
  },
];

/** Same white rounded card as the Appointments page. */
function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="w-full rounded-lg bg-white p-6 shadow-md">
      {title && (
        <h2 className="mb-4 text-2xl font-bold text-black">{title}</h2>
      )}
      {children}
    </section>
  );
}

/** Reads the API's `{ error }` message when there is one. */
async function readError(res: Response, fallback: string) {
  try {
    const body = await res.json();
    return typeof body?.error === "string" ? body.error : fallback;
  } catch {
    return fallback;
  }
}

export default function AdminCaseworkersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAdmin = session?.user?.role === "admin";

  const [data, setData] = useState<DirectoryData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [actionError, setActionError] = useState<string | null>(null);
  /** Resident picked in each caseworker's "Assign resident" select. */
  const [pendingResident, setPendingResident] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/auth/login");
    else if (status === "authenticated" && !isAdmin) {
      router.replace("/auth/unauthorized");
    }
  }, [status, isAdmin, router]);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/caseworkers");
      if (!res.ok) {
        throw new Error(await readError(res, "Unable to load caseworkers."));
      }
      setData(await res.json());
      setLoadError(null);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Unable to load caseworkers."
      );
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && isAdmin) load();
  }, [status, isAdmin, load]);

  if (status !== "authenticated" || !isAdmin) return null;

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError(null);
  };

  const startEdit = (cw: DirectoryCaseworker) => {
    setEditingId(cw.id);
    setFormError(null);
    setForm({
      name: cw.name,
      email: cw.email,
      title: cw.title ?? "",
      phone: cw.phone ?? "",
      room: cw.room ?? "",
      availability: cw.availability ?? "",
      bookingUrl: cw.bookingUrl ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFormError(null);

    const res = await fetch(
      editingId
        ? `/api/admin/caseworkers/${encodeURIComponent(editingId)}`
        : "/api/admin/caseworkers",
      {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );

    setSaving(false);
    if (!res.ok) {
      setFormError(await readError(res, "Unable to save caseworker."));
      return;
    }
    resetForm();
    load();
  };

  /** Runs a delete/assign request, then reloads or shows its error. */
  const runAction = async (request: Promise<Response>, fallback: string) => {
    setActionError(null);
    const res = await request;
    if (!res.ok) {
      setActionError(await readError(res, fallback));
      return;
    }
    load();
  };

  const deleteCaseworker = (cw: DirectoryCaseworker, assignedCount: number) => {
    const extra =
      assignedCount > 0
        ? ` Their ${assignedCount} resident assignment(s) will also be removed.`
        : "";
    if (!window.confirm(`Delete ${cw.name}?${extra}`)) return;
    if (editingId === cw.id) resetForm();
    runAction(
      fetch(`/api/admin/caseworkers/${encodeURIComponent(cw.id)}`, {
        method: "DELETE",
      }),
      "Unable to delete caseworker."
    );
  };

  const assignResident = (caseworkerId: string) => {
    const residentId = pendingResident[caseworkerId];
    if (!residentId) return;
    setPendingResident((prev) => ({ ...prev, [caseworkerId]: "" }));
    runAction(
      fetch("/api/admin/caseworker-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ residentId, caseworkerId }),
      }),
      "Unable to assign resident."
    );
  };

  const removeAssignment = (assignment: Assignment) => {
    runAction(
      fetch(
        `/api/admin/caseworker-assignments/${encodeURIComponent(assignment.id)}`,
        { method: "DELETE" }
      ),
      "Unable to remove assignment."
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />

      <main className="flex-grow bg-gray-100 px-4 py-6">
        <div className="mx-auto w-full max-w-4xl space-y-4">
          <Card>
            <h1 className="text-center text-3xl font-bold text-black">
              Manage Caseworkers
            </h1>
            <p className="mt-1 text-center text-gray-500">
              Residents see their assigned caseworkers on the{" "}
              <Link href="/appointments" className="text-blue-600 hover:underline">
                Appointments
              </Link>{" "}
              page and book through each caseworker&apos;s Microsoft Bookings link.
            </p>
            {data?.source === "salesforce" && (
              <p className="mt-4 rounded border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
                Residents currently see caseworkers from Salesforce. Changes made
                here take effect once <code>CASEWORKER_SOURCE=&quot;local&quot;</code>{" "}
                is set in <code>.env</code>.
              </p>
            )}
          </Card>

          <Card title={editingId ? "Edit Caseworker" : "Add Caseworker"}>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              {FIELDS.map((field) => (
                <label
                  key={field.key}
                  className={`block ${field.key === "bookingUrl" ? "md:col-span-2" : ""}`}
                >
                  <span className="mb-1 block text-sm font-semibold text-gray-700">
                    {field.label}
                    {field.required && <span className="text-red-600"> *</span>}
                  </span>
                  <input
                    type={field.type ?? "text"}
                    required={field.required}
                    value={form[field.key]}
                    placeholder={field.placeholder}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2 text-black"
                  />
                </label>
              ))}

              {formError && (
                <p className="text-red-600 md:col-span-2">{formError}</p>
              )}

              <div className="flex gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {saving ? "Saving…" : editingId ? "Save Changes" : "Add Caseworker"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded border border-gray-300 px-5 py-2 text-black hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </Card>

          <Card title="Caseworkers">
            {actionError && <p className="mb-3 text-red-600">{actionError}</p>}

            {loadError ? (
              <p className="text-red-600">{loadError}</p>
            ) : !data ? (
              <p className="text-gray-500">Loading caseworkers…</p>
            ) : data.caseworkers.length === 0 ? (
              <p className="text-gray-500">
                No caseworkers yet. Add one above.
              </p>
            ) : (
              <div className="space-y-4">
                {data.caseworkers.map((cw) => {
                  const assigned = data.assignments.filter(
                    (a) => a.caseworkerEmail.toLowerCase() === cw.email
                  );
                  const assignedIds = new Set(assigned.map((a) => a.resident.id));
                  const available = data.residents.filter((r) => !assignedIds.has(r.id));

                  return (
                    <div key={cw.id} className="rounded-lg border-2 border-blue-600 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 text-sm text-gray-700">
                          <p className="text-lg font-bold text-black">{cw.name}</p>
                          {cw.title && <p className="text-gray-500">{cw.title}</p>}
                          <p className="mt-1">{cw.email}</p>
                          {cw.phone && <p>{cw.phone}</p>}
                          {cw.room && <p>Room: {cw.room}</p>}
                          {cw.availability && <p>{cw.availability}</p>}
                          {cw.bookingUrl ? (
                            <a
                              href={cw.bookingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 inline-block break-all text-blue-600 hover:underline"
                            >
                              Bookings page ↗
                            </a>
                          ) : (
                            <p className="mt-1 text-yellow-700">
                              No booking link: residents can&apos;t book with
                              this caseworker yet.
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(cw)}
                            className="rounded border border-gray-300 px-3 py-1 text-sm text-black hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCaseworker(cw, assigned.length)}
                            className="rounded border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-gray-200 pt-3">
                        <p className="mb-2 text-sm font-semibold text-gray-700">
                          Assigned residents
                        </p>
                        {assigned.length === 0 ? (
                          <p className="text-sm text-gray-500">None yet.</p>
                        ) : (
                          <ul className="flex flex-wrap gap-2">
                            {assigned.map((a) => (
                              <li
                                key={a.id}
                                className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm text-black"
                              >
                                {a.resident.name}
                                <button
                                  type="button"
                                  onClick={() => removeAssignment(a)}
                                  aria-label={`Unassign ${a.resident.name}`}
                                  className="text-gray-500 hover:text-red-600"
                                >
                                  ×
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}

                        {available.length > 0 && (
                          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                            <select
                              value={pendingResident[cw.id] ?? ""}
                              onChange={(e) =>
                                setPendingResident((prev) => ({
                                  ...prev,
                                  [cw.id]: e.target.value,
                                }))
                              }
                              aria-label={`Assign a resident to ${cw.name}`}
                              className="rounded border border-gray-300 px-3 py-2 text-sm text-black sm:flex-grow"
                            >
                              <option value="">Choose a resident…</option>
                              {available.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name} ({r.email})
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => assignResident(cw.id)}
                              disabled={!pendingResident[cw.id]}
                              className="rounded bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-gray-300"
                            >
                              Assign
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
