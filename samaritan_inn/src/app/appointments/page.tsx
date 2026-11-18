"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { can } from "@/lib/permissions";
import SectionCard from "@/components/appointments/SectionCard";
import CaseworkerProfileCard from "./_components/CaseworkerProfileCard";
import {
  getOwnCaseworkerView,
  type OwnCaseworkerView,
} from "@/lib/appointments/appointments-data";

/**
 * My Appointments (titled "My Information" for coaches, who see and edit their
 * own coach profile here). Residents find and book their Empowerment Coach on
 * /empowerment-coaches (linked from here), through the coach's Outlook Bookings
 * page. The old in-app "Upcoming Appointments" list was retired with that flow.
 */
const AppointmentsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ── Coach's own profile (coaches only, via /api/caseworkers/me) ──
  const isCoach = can(session?.user?.role, "EDIT_OWN_COACH_PROFILE");
  const isAdmin = can(session?.user?.role, "MANAGE_COACH_ACCOUNTS");
  const [ownView, setOwnView] = useState<OwnCaseworkerView | null>(null);
  const [ownViewError, setOwnViewError] = useState<string | null>(null);

  // Send logged-out visitors away, same as the Classes page.
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/unauthorized");
    }
  }, [status, router]);

  // Load the coach's own profile once the session is confirmed.
  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;

    if (isCoach) {
      getOwnCaseworkerView()
        .then((view) => {
          if (!cancelled) setOwnView(view);
        })
        .catch((error) => {
          if (!cancelled) {
            setOwnViewError(
              error instanceof Error
                ? error.message
                : "Unable to load your Empowerment Coach profile."
            );
          }
        });
    }

    return () => {
      cancelled = true;
    };
  }, [status, isCoach]);

  // Don't flash page content while the session is being checked or while
  // redirecting a logged-out visitor.
  if (status !== "authenticated") return null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />

      {/* One gray page area; the cards stack inside it with even spacing. */}
      <main className="flex-grow bg-gray-100 px-4 py-6">
        <div className="mx-auto w-full max-w-4xl space-y-4">
          {/* ── Page header ── */}
          <SectionCard>
            <h1 className="text-center text-3xl font-bold text-black">
              {isCoach ? "My Information" : "My Appointments"}
            </h1>
            <p className="mt-1 text-center text-gray-500">
              {isCoach
                ? "Your Empowerment Coach details, as residents see them."
                : "Schedule a meeting with an Empowerment Coach."}
            </p>
            {isAdmin && (
              <p className="mt-3 text-center text-sm">
                <Link
                  href="/admin-empowerment-coaches"
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Manage Empowerment Coaches →
                </Link>
              </p>
            )}
          </SectionCard>

          {isCoach ? (
            /* ── Coach: own profile ── */
            <SectionCard title="My Empowerment Coach Profile">
              {ownViewError ? (
                <p className="text-red-600">{ownViewError}</p>
              ) : !ownView ? (
                <p className="text-gray-500">Loading your profile…</p>
              ) : !ownView.profile ? (
                <p className="text-gray-500">
                  Add your Outlook Bookings link on your{" "}
                  <Link href="/profile" className="font-semibold text-blue-600 hover:underline">
                    Profile
                  </Link>{" "}
                  tab to set up your Empowerment Coach profile.
                </p>
              ) : (
                <>
                  {ownView.source === "salesforce" && (
                    <p className="mb-4 rounded border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
                      Residents currently book through Salesforce, so your
                      Outlook / Bookings link isn&apos;t shown to them yet.
                    </p>
                  )}
                  <CaseworkerProfileCard
                    profile={ownView.profile}
                    onSaved={(profile) =>
                      setOwnView((prev) => prev && { ...prev, profile })
                    }
                  />
                </>
              )}
            </SectionCard>
          ) : (
            /* ── Resident: find a coach ── */
            <SectionCard title="Schedule an Appointment">
              <p className="text-gray-700">
                Find your Empowerment Coach and book a time through their
                Outlook Bookings page.
              </p>
              <Link
                href="/empowerment-coaches"
                className="mt-4 block w-full rounded bg-blue-600 py-3 text-center font-bold text-white hover:bg-blue-700"
              >
                Find an Empowerment Coach
              </Link>
            </SectionCard>
          )}
        </div>
      </main>
    </div>
  );
};

export default AppointmentsPage;
