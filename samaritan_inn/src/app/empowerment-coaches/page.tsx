"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { can } from "@/lib/permissions";
import SectionCard from "@/components/appointments/SectionCard";
import CaseworkerCard from "@/components/appointments/CaseworkerCard";
import {
  getCaseworkerData,
  type Caseworker,
  type CaseworkerData,
} from "@/lib/appointments-data";

/**
 * Every Empowerment Coach, for any logged-in user. Residents aren't assigned
 * to a coach: they find theirs here and book through the coach's Outlook /
 * Microsoft Bookings link (or, in Salesforce mode, the in-app time picker).
 */
export default function EmpowermentCoachesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [data, setData] = useState<CaseworkerData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Logged-in users only: coach contact details stay off the open internet.
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/auth/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    getCaseworkerData()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Unable to load Empowerment Coaches."
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [status]);

  // Matches name, title or room, ignoring case.
  const coaches = useMemo(() => {
    const all = data?.coaches ?? [];
    const query = search.trim().toLowerCase();
    if (!query) return all;
    return all.filter((coach) =>
      [coach.name, coach.title, coach.room].some((value) =>
        value?.toLowerCase().includes(query)
      )
    );
  }, [data, search]);

  if (status !== "authenticated") return null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />

      <main className="flex-grow bg-gray-100 px-4 py-6">
        <div className="mx-auto w-full max-w-4xl space-y-4">
          <SectionCard>
            <h1 className="text-center text-3xl font-bold text-black">
              Empowerment Coaches
            </h1>
            <p className="mt-1 text-center text-gray-500">
              Find your Empowerment Coach and book a time with them.
            </p>
            {/* "Coaches" replaced "Appointments" in the menu, so coaches reach
                their coach profile (My Information) from here. */}
            {can(session?.user?.role, "EDIT_OWN_COACH_PROFILE") && (
              <p className="mt-3 text-center text-sm">
                <Link href="/appointments" className="font-semibold text-blue-600 hover:underline">
                  My Information →
                </Link>
              </p>
            )}
          </SectionCard>

          <SectionCard>
            {loadError ? (
              <p className="text-red-600">{loadError}</p>
            ) : !data ? (
              <p className="text-gray-500">Loading Empowerment Coaches…</p>
            ) : data.coaches.length === 0 ? (
              <p className="text-gray-500">
                No Empowerment Coaches have been added yet. Please check with
                the front desk.
              </p>
            ) : (
              <>
                <label htmlFor="coach-search" className="sr-only">
                  Search Empowerment Coaches
                </label>
                <input
                  id="coach-search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, title or room"
                  className="mb-4 h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-black"
                />

                {coaches.length === 0 ? (
                  <p className="text-gray-500">
                    No Empowerment Coaches match &ldquo;{search.trim()}&rdquo;.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {coaches.map((coach) => (
                      <li key={coach.id}>
                        <CaseworkerCard caseworker={coach} bookingHours={data.bookingHours}>
                          <BookAction coach={coach} local={data.source === "local"} />
                        </CaseworkerCard>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </SectionCard>
        </div>
      </main>
    </div>
  );
}

/** The Book button for one coach, depending on how they can be booked. */
function BookAction({ coach, local }: { coach: Caseworker; local: boolean }) {
  const button =
    "block w-full rounded bg-blue-600 py-3 text-center font-bold text-white hover:bg-blue-700 sm:inline-block sm:w-auto sm:px-6";

  if (coach.bookingUrl) {
    // A real link (not window.open) so popup blockers don't stop it.
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <a href={coach.bookingUrl} target="_blank" rel="noopener noreferrer" className={button}>
          Book an Appointment
        </a>
        <span className="text-sm text-gray-500">Opens Bookings in a new tab.</span>
      </div>
    );
  }

  if (!local) {
    // Salesforce mode: book through the in-app time picker.
    return (
      <Link
        href={`/appointments/calendar-form?ownerId=${encodeURIComponent(coach.id)}`}
        className={button}
      >
        Book an Appointment
      </Link>
    );
  }

  return (
    <p className="text-sm text-gray-600">
      Online booking isn&apos;t set up for this coach yet. Contact them by email
      or phone, or ask at the front desk.
    </p>
  );
}
