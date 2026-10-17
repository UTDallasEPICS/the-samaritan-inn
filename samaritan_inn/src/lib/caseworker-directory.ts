/**
 * Server-only caseworker directory: caseworkers that staff manage inside the
 * app (/admin-caseworkers), each with a Microsoft Bookings link residents are
 * sent to when they book.
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

/** Admin view also shows which login account owns each profile. */
export const adminCaseworkerSelect = {
  ...caseworkerSelect,
  user: { select: { id: true, name: true, email: true } },
} satisfies Prisma.CaseworkerSelect;

/**
 * Same response shape as the Salesforce branch of GET /api/caseworkers, plus
 * `source` so the page knows booking happens on Microsoft Bookings.
 */
export async function getLocalCaseworkerData(residentId: string) {
  const [assignments, caseworkers] = await Promise.all([
    prisma.caseworkerAssignment.findMany({
      where: { residentId },
      select: { caseworkerEmail: true },
    }),
    prisma.caseworker.findMany({
      select: caseworkerSelect,
      orderBy: { name: "asc" },
    }),
  ]);

  const assigned = new Set(
    assignments.map((a) => a.caseworkerEmail.trim().toLowerCase())
  );

  return {
    source: "local" as const,
    myCaseworkers: caseworkers.filter((cw) => assigned.has(cw.email)),
    // Only caseworkers with a Bookings link can actually be booked.
    bookableCaseworkers: caseworkers.filter((cw) => cw.bookingUrl),
    // Each caseworker carries their own `availability` text instead.
    bookingHours: "",
  };
}

// ── Admin API helpers ─────────────────────────────────────────────────────────

/** Returns a JSON error response unless the user can manage caseworkers, or null when allowed. */
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
 * Error message when `userId` can't own a caseworker profile, or null when it
 * can. Only caseworker accounts are linkable, since only they get the
 * caseworker view on /appointments.
 */
export async function checkLinkableAccount(userId: string | null) {
  if (userId === null) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!user) return "Login account not found.";
  if (user.role !== "caseworker") {
    return "Only accounts with the caseworker role can be linked. Change the role on Manage Users first.";
  }
  return null;
}

// ── Caseworker's own view ─────────────────────────────────────────────────────

/**
 * The logged-in caseworker's profile and their assigned residents, or null
 * when no profile is linked to this account yet.
 */
export async function getOwnCaseworkerView(userId: string) {
  const profile = await prisma.caseworker.findUnique({
    where: { userId },
    select: caseworkerSelect,
  });
  if (!profile) return null;

  const assignments = await prisma.caseworkerAssignment.findMany({
    where: { caseworkerEmail: profile.email },
    orderBy: { resident: { name: "asc" } },
    select: {
      createdAt: true,
      resident: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          // Latest work schedule carries the resident's room and employment.
          WorkSchedule: {
            orderBy: { submittedAt: "desc" },
            take: 1,
            select: {
              room: true,
              employmentStatus: true,
              employerName: true,
              submittedAt: true,
            },
          },
          _count: {
            select: {
              PassRequest: { where: { status: "PENDING" } },
              ExtendedCurfewRequest: { where: { status: "PENDING" } },
              WorkSchedule: { where: { status: "PENDING" } },
            },
          },
        },
      },
    },
  });

  return {
    source: getCaseworkerSource(),
    profile,
    residents: assignments.map(({ createdAt, resident }) => {
      const latest = resident.WorkSchedule[0] ?? null;
      const pending = resident._count;
      return {
        id: resident.id,
        name: resident.name,
        email: resident.email,
        joinedAt: resident.createdAt,
        assignedAt: createdAt,
        room: latest?.room ?? null,
        employmentStatus: latest?.employmentStatus ?? null,
        employerName: latest?.employerName ?? null,
        workScheduleUpdatedAt: latest?.submittedAt ?? null,
        pendingRequests:
          pending.PassRequest +
          pending.ExtendedCurfewRequest +
          pending.WorkSchedule,
      };
    }),
  };
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
