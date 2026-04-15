import { Prisma } from "@prisma/client";
import { addMonths } from "date-fns";
import { prisma } from "@/lib/prisma";

export const BOOKING_TIME_ZONE = "America/Chicago";
export const BOOKABLE_DURATIONS = [30, 60] as const;
export const MAX_ACTIVE_APPOINTMENTS_PER_USER = 7;

const BUSINESS_DAY_START_HOUR = 9;
const BUSINESS_DAY_END_HOUR = 17;
const SLOT_INCREMENT_MINUTES = 30;
const SAME_DAY_LEAD_TIME_MS = 5 * 60 * 60 * 1000;
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type TimeZoneParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

type Interval = {
  start: Date;
  end: Date;
};

type ReserveAppointmentInput = {
  title: string;
  description?: string;
  location?: string;
  ownerId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  bookingDate: string;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class TotalActiveAppointmentLimitError extends ApiError {
  constructor() {
    super(
      429,
      "You already have 7 active appointments. Delete one before booking another."
    );
  }
}

export class SameDayActiveAppointmentError extends ApiError {
  constructor() {
    super(
      409,
      "You already have an appointment for that day. Delete it before booking another."
    );
  }
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function formatDateKey(parts: Pick<TimeZoneParts, "year" | "month" | "day">) {
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
}

function parseDateKey(dateKey: string) {
  if (!DATE_KEY_PATTERN.test(dateKey)) {
    return null;
  }

  const [year, month, day] = dateKey.split("-").map(Number);
  return { year, month, day };
}

function getTimeZoneParts(date: Date, timeZone = BOOKING_TIME_ZONE): TimeZoneParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = formatter
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== "literal") {
        acc[part.type] = part.value;
      }
      return acc;
    }, {});

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

function getTimeZoneOffsetMs(date: Date, timeZone = BOOKING_TIME_ZONE) {
  const parts = getTimeZoneParts(date, timeZone);
  const utcTimestamp = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );

  return utcTimestamp - date.getTime();
}

export function getDateKeyInTimeZone(date: Date, timeZone = BOOKING_TIME_ZONE) {
  return formatDateKey(getTimeZoneParts(date, timeZone));
}

export function getUtcDateForTimeZone(
  dateKey: string,
  hour: number,
  minute = 0,
  second = 0,
  timeZone = BOOKING_TIME_ZONE
) {
  const parsed = parseDateKey(dateKey);

  if (!parsed) {
    throw new ApiError(400, "The requested date must use YYYY-MM-DD.");
  }

  const approximateUtc = new Date(
    Date.UTC(parsed.year, parsed.month - 1, parsed.day, hour, minute, second)
  );
  const offsetMs = getTimeZoneOffsetMs(approximateUtc, timeZone);

  return new Date(approximateUtc.getTime() - offsetMs);
}

export function getDayBounds(dateKey: string) {
  return {
    start: getUtcDateForTimeZone(dateKey, 0, 0, 0),
    end: getUtcDateForTimeZone(dateKey, 23, 59, 59),
  };
}

function getBusinessWindow(dateKey: string) {
  return {
    start: getUtcDateForTimeZone(dateKey, BUSINESS_DAY_START_HOUR),
    end: getUtcDateForTimeZone(dateKey, BUSINESS_DAY_END_HOUR),
  };
}

function getMaxBookableDateKey(now = new Date()) {
  const todayKey = getDateKeyInTimeZone(now);
  const parsed = parseDateKey(todayKey);

  if (!parsed) {
    throw new ApiError(500, "Unable to determine the current booking date.");
  }

  const oneMonthAhead = addMonths(
    new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day)),
    1
  );

  return formatDateKey({
    year: oneMonthAhead.getUTCFullYear(),
    month: oneMonthAhead.getUTCMonth() + 1,
    day: oneMonthAhead.getUTCDate(),
  });
}

export function isDateWithinBookingWindow(dateKey: string, now = new Date()) {
  const todayKey = getDateKeyInTimeZone(now);
  const maxDateKey = getMaxBookableDateKey(now);

  return dateKey >= todayKey && dateKey <= maxDateKey;
}

function getDurationMinutes(interval: Interval) {
  return (interval.end.getTime() - interval.start.getTime()) / (60 * 1000);
}

function ensureDateObject(value: Date, label: string) {
  if (Number.isNaN(value.getTime())) {
    throw new ApiError(400, `${label} is not a valid date.`);
  }
}

function ensureAllowedDuration(durationMinutes: number) {
  if (
    !BOOKABLE_DURATIONS.includes(
      durationMinutes as (typeof BOOKABLE_DURATIONS)[number]
    )
  ) {
    throw new ApiError(400, "Appointments must be 30 minutes or 1 hour long.");
  }
}

function ensureHalfHourBoundary(date: Date) {
  const parts = getTimeZoneParts(date);

  if ((parts.minute !== 0 && parts.minute !== 30) || parts.second !== 0) {
    throw new ApiError(
      400,
      "Appointments must start on the hour or half hour."
    );
  }
}

export function intervalsOverlap(a: Interval, b: Interval) {
  return a.start < b.end && a.end > b.start;
}

export function isIntervalAvailable(interval: Interval, booked: Interval[]) {
  return booked.every((bookedInterval) => !intervalsOverlap(interval, bookedInterval));
}

export function validateBookingRequest(interval: Interval, now = new Date()) {
  ensureDateObject(interval.start, "startDate");
  ensureDateObject(interval.end, "endDate");

  if (interval.end <= interval.start) {
    throw new ApiError(400, "The appointment end time must be after the start time.");
  }

  const durationMinutes = getDurationMinutes(interval);
  ensureAllowedDuration(durationMinutes);
  ensureHalfHourBoundary(interval.start);

  const bookingDate = getDateKeyInTimeZone(interval.start);
  const finalInstant = new Date(interval.end.getTime() - 1);
  const finalDate = getDateKeyInTimeZone(finalInstant);

  if (bookingDate !== finalDate) {
    throw new ApiError(
      400,
      "Appointments must start and end on the same Central Time calendar day."
    );
  }

  if (!isDateWithinBookingWindow(bookingDate, now)) {
    throw new ApiError(
      400,
      "Appointments can only be booked from today through the same calendar date next month."
    );
  }

  if (
    bookingDate === getDateKeyInTimeZone(now) &&
    interval.start.getTime() - now.getTime() < SAME_DAY_LEAD_TIME_MS
  ) {
    throw new ApiError(
      400,
      "Same-day appointments must start at least 5 hours from now."
    );
  }

  const businessWindow = getBusinessWindow(bookingDate);

  if (interval.start < businessWindow.start || interval.end > businessWindow.end) {
    throw new ApiError(
      400,
      "Appointments must stay within business hours of 9:00 AM to 5:00 PM Central Time."
    );
  }

  return {
    bookingDate,
    durationMinutes,
  };
}

export function buildAvailableSlots(dateKey: string, booked: Interval[], now = new Date()) {
  if (!parseDateKey(dateKey)) {
    throw new ApiError(400, "The requested date must use YYYY-MM-DD.");
  }

  if (!isDateWithinBookingWindow(dateKey, now)) {
    return [];
  }

  const { start, end } = getBusinessWindow(dateKey);
  const slots: { start: string; end: string; label: string }[] = [];

  for (
    let cursor = start.getTime();
    cursor + 30 * 60 * 1000 <= end.getTime();
    cursor += SLOT_INCREMENT_MINUTES * 60 * 1000
  ) {
    const slotStart = new Date(cursor);
    const slotEnd = new Date(cursor + 30 * 60 * 1000);
    const interval = { start: slotStart, end: slotEnd };

    try {
      validateBookingRequest(interval, now);
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        continue;
      }

      throw error;
    }

    if (!isIntervalAvailable(interval, booked)) {
      continue;
    }

    slots.push({
      start: slotStart.toISOString(),
      end: slotEnd.toISOString(),
      label: slotStart.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: BOOKING_TIME_ZONE,
      }),
    });
  }

  return slots;
}

function getNextBookingOrdinal(usedOrdinals: Array<number | null>) {
  for (let ordinal = 1; ordinal <= MAX_ACTIVE_APPOINTMENTS_PER_USER; ordinal += 1) {
    if (!usedOrdinals.includes(ordinal)) {
      return ordinal;
    }
  }

  return null;
}

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
  );
}

export async function retirePastActiveAppointments(
  userId: string,
  now = new Date()
) {
  await prisma.appointment.updateMany({
    where: {
      userId,
      activeBookingOrdinal: { not: null },
      endTime: { lt: now },
    },
    data: {
      activeBookingOrdinal: null,
      activeBookingDateKey: null,
    },
  });
}

export async function getActiveAppointmentSummary(
  userId: string,
  bookingDate?: string,
  now = new Date()
) {
  await retirePastActiveAppointments(userId, now);

  const activeAppointments = await prisma.appointment.findMany({
    where: {
      userId,
      activeBookingOrdinal: { not: null },
      endTime: { gte: now },
    },
    select: {
      id: true,
      bookingDate: true,
      activeBookingOrdinal: true,
      activeBookingDateKey: true,
    },
  });

  const hasActiveAppointmentOnDate = bookingDate
    ? activeAppointments.some(
        (appointment) => appointment.activeBookingDateKey === bookingDate
      )
    : false;

  return {
    totalActiveAppointments: activeAppointments.length,
    hasActiveAppointmentOnDate,
  };
}

export async function reserveAppointment(input: ReserveAppointmentInput) {
  for (let attempt = 0; attempt < MAX_ACTIVE_APPOINTMENTS_PER_USER; attempt += 1) {
    try {
      return await prisma.$transaction(async (tx) => {
        await tx.appointment.updateMany({
          where: {
            userId: input.userId,
            activeBookingOrdinal: { not: null },
            endTime: { lt: new Date() },
          },
          data: {
            activeBookingOrdinal: null,
            activeBookingDateKey: null,
          },
        });

        const activeAppointments = await tx.appointment.findMany({
          where: {
            userId: input.userId,
            activeBookingOrdinal: { not: null },
            endTime: { gte: new Date() },
          },
          select: {
            activeBookingOrdinal: true,
            activeBookingDateKey: true,
          },
          orderBy: { activeBookingOrdinal: "asc" },
        });

        if (activeAppointments.length >= MAX_ACTIVE_APPOINTMENTS_PER_USER) {
          throw new TotalActiveAppointmentLimitError();
        }

        if (
          activeAppointments.some(
            (appointment) => appointment.activeBookingDateKey === input.bookingDate
          )
        ) {
          throw new SameDayActiveAppointmentError();
        }

        const nextOrdinal = getNextBookingOrdinal(
          activeAppointments.map((appointment) => appointment.activeBookingOrdinal)
        );

        if (!nextOrdinal) {
          throw new TotalActiveAppointmentLimitError();
        }

        return tx.appointment.create({
          data: {
            title: input.title,
            description: input.description,
            location: input.location,
            ownerId: input.ownerId,
            userId: input.userId,
            startTime: input.startTime,
            endTime: input.endTime,
            bookingDate: input.bookingDate,
            activeBookingOrdinal: nextOrdinal,
            activeBookingDateKey: input.bookingDate,
          },
        });
      });
    } catch (error) {
      if (
        error instanceof TotalActiveAppointmentLimitError ||
        error instanceof SameDayActiveAppointmentError
      ) {
        throw error;
      }

      if (isUniqueConstraintError(error) && attempt < MAX_ACTIVE_APPOINTMENTS_PER_USER - 1) {
        continue;
      }

      throw error;
    }
  }

  throw new TotalActiveAppointmentLimitError();
}

export async function finalizeAppointmentReservation(
  appointmentId: string,
  salesforceEventId: string
) {
  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { salesforceEventId },
  });
}

export async function releaseAppointmentReservation(appointmentId: string) {
  await prisma.appointment.delete({
    where: { id: appointmentId },
  });
}
