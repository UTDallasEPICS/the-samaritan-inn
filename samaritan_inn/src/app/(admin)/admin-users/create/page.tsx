"use client";

// Admin-only "Add resident" form. Access is enforced by admin-users/layout.tsx (page)
// and POST /api/admin/residents (API, returns 401/403 for non-admins).

import { useState } from "react";
import Link from "next/link";
import Navigation from "@/components/shared/Navigation";
import SignupForm from "@/components/admin/SignupForm";
import type { SignupResponse } from "@/components/admin/SignupForm";

type CreatedResident = {
  name: string;
  email: string;
  tempPassword: string;
  emailSent: boolean;
};

// ---- Page ------------------------------------------------------------------
export default function CreateResidentPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedResident | null>(null);
  const [copied, setCopied] = useState(false);

  function handleCreated(data: SignupResponse) {
    setCreated({ name: data.user.name, email: data.user.email, tempPassword: data.tempPassword, emailSent: data.emailSent });
  }

  async function copyCredentials() {
    if (!created) return;
    const text = `The Samaritan Inn\nEmail: ${created.email}\nTemporary password: ${created.tempPassword}\nLog in at ${window.location.origin}/auth/login`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setServerError("Couldn't copy automatically. Select the text and copy it manually.");
    }
  }

  function reset() {
    setServerError(null);
    setCreated(null);
    setCopied(false);
  }

  // ---- Success state: credentials shown once -------------------------------
  if (created) {
    return (
      <Shell title="Resident account created">
        <Notice tone="success">
          <strong>{created.name}</strong> can now log in. This password is shown only once,
          so share it before leaving this page.
        </Notice>
        <div className="mt-3">
          {created.emailSent ? (
            <Notice tone="success">
              An email with a link to set their own password was sent to {created.email}.
            </Notice>
          ) : (
            <Notice tone="warn">
              We couldn&apos;t email {created.email}. Give them the temporary password below; they
              can use &quot;Forgot password?&quot; on the login page to set their own.
            </Notice>
          )}
        </div>

        <div
          id="printable-card"
          className="mt-4 rounded-lg border border-gray-200 p-4 text-sm"
        >
          <p className="font-semibold text-[#06177a]">The Samaritan Inn</p>
          <dl className="mt-3 space-y-2">
            <div>
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium">{created.email}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Temporary password</dt>
              <dd className="font-mono text-base font-semibold tracking-wide">
                {created.tempPassword}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Log in at</dt>
              <dd className="font-medium">{window.location.origin}/auth/login</dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={copyCredentials}
            className="rounded bg-[#4fa3dc] px-5 py-3 text-white hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#06177a]"
          >
            {copied ? "Copied" : "Copy details"}
          </button>
          <button
            onClick={() => window.print()}
            className="rounded border border-gray-300 px-5 py-3 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#06177a]"
          >
            Print card
          </button>
          <button
            onClick={reset}
            className="ml-auto rounded bg-[#5cc26b] px-5 py-3 text-white hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#06177a]"
          >
            Add another resident
          </button>
        </div>
        {serverError && <p className="mt-3 text-sm text-red-700">{serverError}</p>}
      </Shell>
    );
  }

  // ---- Form state ---------------------------------------------------------
  return (
    <Shell title="Add resident">
      <p className="mb-6 text-base leading-relaxed text-gray-800">
        Create an account for a resident. A temporary password will be generated for you to
        give them.
      </p>

      <SignupForm
        endpoint="/api/admin/residents"
        submitLabel="Create account"
        onSuccess={handleCreated}
      />
    </Shell>
  );
}

// ---- Small presentational helpers -----------------------------------------
function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex flex-grow items-start justify-center bg-gray-100 px-4 py-12">
        <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow">
          <Link href="/admin-users" className="text-base font-medium text-blue-700 hover:underline">
            &larr; Back to users
          </Link>
          <h1 className="mb-4 mt-3 text-center text-3xl font-bold text-primary">{title}</h1>
          {children}
        </div>
      </main>
    </div>
  );
}

function Notice({
  tone,
  children,
}: {
  tone: "warn" | "success" | "error";
  children: React.ReactNode;
}) {
  const styles = {
    warn: "border-yellow-300 bg-yellow-50 text-yellow-800",
    success: "border-green-300 bg-green-50 text-green-900",
    error: "border-red-300 bg-red-50 text-red-800",
  }[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded border px-4 py-3 text-sm ${styles}`}>
      {children}
    </div>
  );
}
