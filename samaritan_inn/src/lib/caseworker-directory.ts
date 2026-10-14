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
import { getServerSessionInfo } from "@/lib/getServerSessionInfo";

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

/** Returns a JSON error response for non-admins, or null when allowed. */
export async function checkAdmin(request: NextRequest) {
  const session = await getServerSessionInfo(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "admin") {
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

// ── Input validation ──────────────────────────────────────────────────────────

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Booking links are shown to residents as a button, so only Microsoft's
 * Bookings hosts are accepted. A typo or a pasted look-alike link can't send
 * residents to an unrelated site. Add a host here if Microsoft serves Bookings
 * pages from another domain for Samaritan Inn's tenant.
 */
const BOOKINGS_HOSTS = new Set([
  "bookings.cloud.microsoft", // current format for new Bookings pages
  "outlook.office.com",
  "outlook.office365.com",
]);

export type CaseworkerInput = {
  name: string;
  title: string | null;
  email: string;
  phone: string | null;
  room: string | null;
  availability: string | null;
  bookingUrl: string | null;
};

type ParseResult = { data: CaseworkerInput } | { error: string };

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

function parseBookingUrl(value: string | null) {
  if (value === null) return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new InputError("Booking link must be a full URL starting with https://.");
  }

  if (url.protocol !== "https:" || !BOOKINGS_HOSTS.has(url.hostname)) {
    throw new InputError(
      "Booking link must be a Microsoft Bookings page (https://bookings.cloud.microsoft/... or https://outlook.office.com/...)."
    );
  }
  return url.toString();
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
        phone: optionalText(input.phone, "Phone", 50),
        room: optionalText(input.room, "Room", 100),
        availability: optionalText(input.availability, "Availability", 200),
        bookingUrl: parseBookingUrl(
          optionalText(input.bookingUrl, "Booking link", 2000)
        ),
      },
    };
  } catch (error) {
    if (error instanceof InputError) return { error: error.message };
    throw error;
  }
}
