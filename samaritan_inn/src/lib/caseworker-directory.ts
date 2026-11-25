/**
 * Server-only Empowerment Coach directory: coaches that staff manage inside
 * the app (/admin-empowerment-coaches), each with an Outlook / Microsoft
 * Bookings link residents are sent to when they book. In code they're still
 * called "caseworkers" (the Caseworker model and the "caseworker" role); only
 * the text people see says "Empowerment Coach".
 *
 * Residents aren't assigned to a coach: every logged-in user sees the full
 * list on /empowerment-coaches and picks their coach there. The old
 * CaseworkerAssignment table is kept in the database but no longer used.
 *
 * Only used when CASEWORKER_SOURCE="local". When the variable is unset or set
 * to anything else, the app keeps reading caseworkers from Salesforce
 * (src/lib/caseworkers.ts) exactly as before, so turning this off is a one-line
 * .env change with no code change.
 *
 * Do not import this from client components.
 */
import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/permissions";
import { getServerSessionInfo } from "@/lib/getServerSessionInfo";
import {
  FIELD_MAX_LENGTH,
  checkAvailability,
  checkBookingUrl,
  checkPhone,
} from "@/lib/caseworker-fields";

export type CaseworkerSource = "local" | "salesforce";

/** Which system the Appointments page reads caseworkers from. */
export function getCaseworkerSource(): CaseworkerSource {
  return process.env.CASEWORKER_SOURCE?.trim().toLowerCase() === "local"
    ? "local"
    : "salesforce";
}

/** Fields returned to the browser; timestamps stay server-side. */
export const caseworkerSelect = {
  id: true,
  name: true,
  title: true,
  email: true,
  phone: true,
  room: true,
  availability: true,
  bookingUrl: true,
} satisfies Prisma.CaseworkerSelect;

/**
 * Admin view also shows which login account owns each profile, and when it
 * last changed so an admin edit can't overwrite a newer caseworker edit.
 */
export const adminCaseworkerSelect = {
  ...caseworkerSelect,
  updatedAt: true,
  user: { select: { id: true, name: true, email: true } },
} satisfies Prisma.CaseworkerSelect;

/**
 * Every coach in the directory, for /empowerment-coaches. Same response shape
 * as the Salesforce branch of GET /api/caseworkers, plus `source` so the page
 * knows booking happens on Microsoft Bookings. Coaches without a Bookings link
 * are listed too; the page shows that they can't be booked yet.
 */
export async function getLocalCaseworkerData() {
  const coaches = await prisma.caseworker.findMany({
    select: caseworkerSelect,
    orderBy: { name: "asc" },
  });

  return {
    source: "local" as const,
    coaches,
    // Each coach carries their own `availability` text instead.
    bookingHours: "",
  };
}

// ── Admin API helpers ─────────────────────────────────────────────────────────

/** Returns a JSON error response unless the user can manage coaches, or null when allowed. */
export async function checkAdmin(request: NextRequest) {
  const session = await getServerSessionInfo(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!can(session.role, "MANAGE_COACH_ACCOUNTS")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export function isUniqueViolation(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

/** True when a unique violation was on Caseworker.userId (account already linked). */
export function isLinkedAccountViolation(error: unknown) {
  return (
    isUniqueViolation(error) &&
    String((error as Prisma.PrismaClientKnownRequestError).meta?.target).includes("userId")
  );
}

/**
 * Error message when `userId` can't own a coach profile, or null when it can.
 * Only accounts with the "caseworker" role (shown as Empowerment Coach) are
 * linkable, since only they get the coach view on /appointments. Admins manage
 * everyone's profile on /admin-empowerment-coaches instead.
 */
export async function checkLinkableAccount(userId: string | null) {
  if (userId === null) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!user) return "Login account not found.";
  if (user.role !== "caseworker") {
    return "Only accounts with the Empowerment Coach role can be linked. Change the role on Manage Users first.";
  }
  return null;
}

// ── Coach's own view ──────────────────────────────────────────────────────────

/** Thrown by connectOwnProfile; its message is shown to the coach. */
export class ProfileConnectError extends Error {}

/**
 * Returns the id of the coach profile owned by `userId`, linking or creating
 * one the first time a coach saves their own details:
 * 1. a profile already linked to this account is used as is;
 * 2. otherwise an unlinked profile with the account's email (one an admin
 *    added before the coach had an account) is linked to this account;
 * 3. otherwise a new profile is created from the account's name and email.
 * Title and room stay empty for an admin to fill in on /admin-empowerment-coaches.
 */
export async function connectOwnProfile(userId: string) {
  const linked = await prisma.caseworker.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (linked) return linked.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });
  if (!user) throw new ProfileConnectError("Login account not found.");

  // Profile emails are stored lowercase (see parseCaseworkerInput).
  const email = user.email.trim().toLowerCase();
  const sameEmail = await prisma.caseworker.findUnique({
    where: { email },
    select: { id: true, userId: true },
  });

  if (sameEmail) {
    if (sameEmail.userId) {
      throw new ProfileConnectError(
        "The Empowerment Coach profile with your email belongs to another account. Ask an admin."
      );
    }
    await prisma.caseworker.update({
      where: { id: sameEmail.id },
      data: { userId },
    });
    return sameEmail.id;
  }

  try {
    const created = await prisma.caseworker.create({
      data: { name: user.name, email, userId },
      select: { id: true },
    });
    return created.id;
  } catch (error) {
    // Another request linked or created it at the same moment.
    if (isUniqueViolation(error)) {
      throw new ProfileConnectError(
        "Your Empowerment Coach profile was just set up. Please try again."
      );
    }
    throw error;
  }
}

/**
 * The logged-in coach's own profile, or null when no profile is linked to this
 * account yet.
 */
export async function getOwnCaseworkerView(userId: string) {
  const profile = await prisma.caseworker.findUnique({
    where: { userId },
    select: caseworkerSelect,
  });
  if (!profile) return null;
  return { source: getCaseworkerSource(), profile };
}

// ── Input validation ──────────────────────────────────────────────────────────

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type CaseworkerInput = {
  name: string;
  title: string | null;
  email: string;
  phone: string | null;
  room: string | null;
  availability: string | null;
  bookingUrl: string | null;
  userId: string | null;
};

type ParseResult = { data: CaseworkerInput } | { error: string };

/**
 * Fields a caseworker may change on their own profile. Name, title, email and
 * room stay admin-only: email is the key resident assignments are linked by,
 * and the rest are set by the organization.
 */
export type CaseworkerSelfInput = Pick<
  CaseworkerInput,
  "phone" | "availability" | "bookingUrl"
>;

/** Thrown by the field parsers below; its message is shown to the admin. */
class InputError extends Error {}

function optionalText(value: unknown, label: string, max = 200) {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") throw new InputError(`${label} must be text.`);
  const trimmed = value.trim();
  if (trimmed.length > max) {
    throw new InputError(`${label} must be ${max} characters or fewer.`);
  }
  return trimmed || null;
}

/** Booking link rules live in caseworker-fields.ts, shared with the browser. */
function parseBookingUrl(value: string | null) {
  if (value === null) return null;
  const result = checkBookingUrl(value);
  if ("error" in result) throw new InputError(result.error);
  return result.value;
}

function parsePhone(value: unknown) {
  const phone = optionalText(value, "Phone", FIELD_MAX_LENGTH.phone);
  const error = phone && checkPhone(phone);
  if (error) throw new InputError(error);
  return phone;
}

function parseAvailability(value: unknown) {
  const availability = optionalText(value, "Availability", FIELD_MAX_LENGTH.availability);
  const error = availability && checkAvailability(availability);
  if (error) throw new InputError(error);
  return availability;
}

export function parseCaseworkerInput(body: unknown): ParseResult {
  if (!body || typeof body !== "object") {
    return { error: "Invalid request body." };
  }
  const input = body as Record<string, unknown>;

  try {
    const name = optionalText(input.name, "Name", 100);
    if (!name) throw new InputError("Name is required.");

    const email = optionalText(input.email, "Email", 254);
    if (!email || !EMAIL_PATTERN.test(email)) {
      throw new InputError("A valid email is required.");
    }

    return {
      data: {
        name,
        email: email.toLowerCase(),
        title: optionalText(input.title, "Title", 100),
        phone: parsePhone(input.phone),
        room: optionalText(input.room, "Room", 100),
        availability: parseAvailability(input.availability),
        bookingUrl: parseBookingUrl(
          optionalText(input.bookingUrl, "Booking link", FIELD_MAX_LENGTH.bookingUrl)
        ),
        userId: optionalText(input.userId, "Login account", 100),
      },
    };
  } catch (error) {
    if (error instanceof InputError) return { error: error.message };
    throw error;
  }
}

/** Fields left out of the body are left unchanged; any other keys are ignored. */
export function parseCaseworkerSelfInput(
  body: unknown
): { data: Partial<CaseworkerSelfInput> } | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Invalid request body." };
  }
  const input = body as Record<string, unknown>;

  try {
    const data: Partial<CaseworkerSelfInput> = {};
    if ("phone" in input) data.phone = parsePhone(input.phone);
    if ("availability" in input) {
      data.availability = parseAvailability(input.availability);
    }
    if ("bookingUrl" in input) {
      data.bookingUrl = parseBookingUrl(
        optionalText(input.bookingUrl, "Booking link", FIELD_MAX_LENGTH.bookingUrl)
      );
    }
    return { data };
  } catch (error) {
    if (error instanceof InputError) return { error: error.message };
    throw error;
  }
}
