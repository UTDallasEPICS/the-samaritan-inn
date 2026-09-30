/**
 * Mock data layer for the Appointments page.
 *
 * Everything here is placeholder data. The point of this file is that the UI
 * never knows (or cares) where caseworker data actually comes from. When the
 * team settles on a real source — Outlook, Salesforce, or our own database —
 * only the bodies of the functions at the bottom change. No page or component
 * that calls them has to be touched.
 *
 * The functions are `async` on purpose even though they return instantly today:
 * a real API call takes time, so the UI already handles loading and error states.
 */

/** One caseworker (the partner may call these "coaches" — see the TODO below). */
export type Caseworker = {
  id: string;
  name: string;
  /** Job title shown under the name, e.g. "Case Worker". */
  role: string;
  /** Path to an image in /public, or null to fall back to a generic avatar. */
  avatarUrl: string | null;
  availability: string;
  email: string;
  phone: string;
  room: string;
};

/** One booked appointment shown in the "Upcoming Appointments" card. */
export type UpcomingAppointment = {
  id: string;
  caseworker: Caseworker;
  /** ISO 8601 timestamp. The "-05:00" is US Central time. */
  startTime: string;
};

// TODO(team): none of the fields below except name/email exist in our database
// yet, and nothing links a resident to "their" caseworker. Confirm with the
// partner where each field lives before wiring a real API:
//   - availability / phone / room  -> Outlook? Salesforce? our own User table?
//   - resident -> caseworker assignment -> who owns that relationship?

const JOHN_DOE: Caseworker = {
  id: "cw-1",
  name: "John Doe",
  role: "Case Worker",
  avatarUrl: "/samaritan-inn-avatar.png",
  availability: "Mon–Fri, 9:00 AM – 5:00 PM",
  email: "john.doe@samaritaninn.org",
  phone: "(972) 555-0148",
  room: "Office B-204",
};

const JANE_SMITH: Caseworker = {
  id: "cw-2",
  name: "Jane Smith",
  role: "Case Worker",
  avatarUrl: "/samaritan-inn-avatar.png",
  availability: "Mon–Thu, 8:00 AM – 4:00 PM",
  email: "jane.smith@samaritaninn.org",
  phone: "(972) 555-0192",
  room: "Office B-207",
};

/** Pretend the network took a moment, so loading states are visible in dev. */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * The caseworker(s) assigned to the logged-in resident.
 * Real version: look up the assignment for the current user.
 */
export async function getMyCaseworkers(): Promise<Caseworker[]> {
  await delay(300);
  return [JOHN_DOE];
}

/**
 * Everyone a resident is allowed to book with. Deliberately a separate
 * function from getMyCaseworkers(): "who am I assigned to" and "who can I
 * book with" are different questions and may have different answers.
 */
export async function getBookableCaseworkers(): Promise<Caseworker[]> {
  await delay(300);
  return [JOHN_DOE, JANE_SMITH];
}

/** Appointments the logged-in resident has already booked. */
export async function getUpcomingAppointments(): Promise<UpcomingAppointment[]> {
  await delay(300);
  return [
    {
      id: "appt-1",
      caseworker: JOHN_DOE,
      startTime: "2026-10-06T10:30:00-05:00",
    },
  ];
}
