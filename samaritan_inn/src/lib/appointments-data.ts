/**
 * Data layer for the Appointments and Empowerment Coaches pages (browser side).
 * Empowerment Coaches are still called "caseworkers" in code.
 *
 * Every value here comes from the app's API routes, which read real data:
 * caseworker details from Salesforce (via src/lib/caseworkers.ts) and
 * appointments from our database. Nothing in this file is hardcoded, so a
 * change of data source (e.g. Salesforce → Outlook) never touches the UI.
 */

/** One caseworker. Any detail Salesforce doesn't have on file is null. */
export type Caseworker = {
  /** Salesforce User id (also the calendar id used when booking), or the
   *  in-app directory id when caseworkers come from the local directory. */
  id: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  // Only set by the in-app directory (CASEWORKER_SOURCE="local"):
  room?: string | null;
  /** Free text, e.g. "Mon–Fri, 9:00 AM – 5:00 PM". */
  availability?: string | null;
  /** Microsoft Bookings page. When present, booking opens this link. */
  bookingUrl?: string | null;
};

export type CaseworkerData = {
  /** "local" = in-app directory + Bookings links; absent = Salesforce. */
  source?: "local";
  /** Every Empowerment Coach residents can find on /empowerment-coaches. In
   *  local mode this includes coaches who haven't added a Bookings link yet. */
  coaches: Caseworker[];
  /** e.g. "Every day, 9:00 AM – 5:00 PM (Central Time)". Empty in local
   *  mode, where each coach has their own `availability` instead. */
  bookingHours: string;
};

/** One booked appointment, as returned by GET /api/my-events. */
export type UpcomingAppointment = {
  id: string;
  title: string;
  description: string | null;
  /** ISO 8601 timestamps. */
  startTime: string;
  endTime: string;
  ownerId: string | null;
  /** Null when the caseworker's record couldn't be looked up. */
  caseWorker: string | null;
  caseWorkerTitle: string | null;
};

/** Reads the API's `{ error }` message when there is one. */
async function readError(res: Response, fallback: string) {
  try {
    const body = await res.json();
    return typeof body?.error === "string" ? body.error : fallback;
  } catch {
    return fallback;
  }
}

export async function getCaseworkerData(): Promise<CaseworkerData> {
  const res = await fetch("/api/caseworkers");
  if (!res.ok) {
    throw new Error(await readError(res, "Unable to load Empowerment Coaches."));
  }
  return res.json();
}

/** The resident's appointments that haven't ended yet, soonest first. */
export async function getUpcomingAppointments(): Promise<UpcomingAppointment[]> {
  const res = await fetch("/api/my-events");
  if (!res.ok) {
    throw new Error(await readError(res, "Unable to load your appointments."));
  }

  const appointments: UpcomingAppointment[] = await res.json();
  const now = Date.now();

  return appointments
    .filter((appt) => new Date(appt.endTime).getTime() > now)
    .sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
}

/** Cancels an appointment in both our database and Salesforce. */
export async function cancelAppointment(id: string): Promise<void> {
  const res = await fetch(`/api/my-events/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(await readError(res, "Unable to cancel this appointment."));
  }
}

// ── Coach's own view (GET/PATCH /api/caseworkers/me) ──────────────────────────

export type OwnCaseworkerView = {
  /** Where residents currently book; absent when no profile is linked. */
  source?: "local" | "salesforce";
  /** Null until the coach first saves their link or an admin links their account. */
  profile: Required<Caseworker> | null;
};

/** The fields a coach may edit on their own profile. */
export type CaseworkerSelfEdit = {
  phone: string;
  availability: string;
  bookingUrl: string;
};

export async function getOwnCaseworkerView(): Promise<OwnCaseworkerView> {
  const res = await fetch("/api/caseworkers/me");
  if (!res.ok) {
    throw new Error(await readError(res, "Unable to load your Empowerment Coach profile."));
  }
  return res.json();
}

/** Saves one or more of the coach's editable fields and returns the updated profile. */
export async function updateOwnCaseworkerProfile(
  fields: Partial<CaseworkerSelfEdit>
): Promise<Required<Caseworker>> {
  const res = await fetch("/api/caseworkers/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
  if (!res.ok) {
    throw new Error(await readError(res, "Unable to save your profile."));
  }
  return res.json();
}
