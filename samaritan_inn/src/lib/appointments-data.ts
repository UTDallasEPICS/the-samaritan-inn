/**
 * Data layer for the Appointments page (browser side).
 *
 * Every value here comes from the app's API routes, which read real data:
 * caseworker details from Salesforce (via src/lib/caseworkers.ts) and
 * appointments from our database. Nothing in this file is hardcoded, so a
 * change of data source (e.g. Salesforce → Outlook) never touches the UI.
 */

/** One caseworker. Any detail Salesforce doesn't have on file is null. */
export type Caseworker = {
  /** Salesforce User id; also the calendar id used when booking. */
  id: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
};

export type CaseworkerData = {
  /** Caseworker(s) assigned to the logged-in resident. */
  myCaseworkers: Caseworker[];
  /** Everyone the resident is allowed to book with. */
  bookableCaseworkers: Caseworker[];
  /** e.g. "Every day, 9:00 AM – 5:00 PM (Central Time)". */
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
    throw new Error(await readError(res, "Unable to load caseworker information."));
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
