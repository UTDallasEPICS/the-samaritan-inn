import { getDayBounds } from "@/lib/booking";

const SALESFORCE_API_VERSION = "v59.0";
const WORK_SCHEDULE_API_VERSION = "v65.0";
const SALESFORCE_ID_PATTERN = /^[a-zA-Z0-9]{15,18}$/;
const TOKEN_CACHE_FALLBACK_MS = 5 * 60 * 1000;

let cachedSalesforceToken: { accessToken: string; expiresAt: number } | null = null;

export type SalesforceEventRecord = {
  Id?: string;
  StartDateTime: string;
  EndDateTime: string;
  Subject?: string;
  Description?: string | null;
  Location?: string | null;
};

type SalesforceWorkScheduleInput = {
  weekOf: Date;
  employerName: string | null;
  employerLocation: string | null;
  estimatedTravelTime: string;
  transportation: string;
  commentsNotes: string | null;
  days: {
    dayOfWeek: string;
    startTime: string | null;
    endTime: string | null;
  }[];
};

export class SalesforceError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = "SalesforceError";
  }
}

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getSalesforceLoginUrl() {
  return (process.env.SF_DOMAIN_URL || getRequiredEnv("SF_LOGIN_URL")).replace(/\/+$/, "");
}

function getSalesforceInstanceUrl() {
  return (process.env.SF_INSTANCE_URL || getRequiredEnv("SF_DOMAIN_URL")).replace(/\/+$/, "");
}

export function isValidSalesforceId(value: string) {
  return SALESFORCE_ID_PATTERN.test(value);
}

export function resolveSalesforceOwnerId(ownerId?: string | null) {
  const resolvedOwnerId = ownerId ?? process.env.SF_OWNER_ID;

  if (!resolvedOwnerId || !isValidSalesforceId(resolvedOwnerId)) {
    return null;
  }

  return resolvedOwnerId;
}

export async function getSalesforceToken() {
  if (cachedSalesforceToken && cachedSalesforceToken.expiresAt > Date.now()) {
    return cachedSalesforceToken.accessToken;
  }

  const response = await fetch(
    `${getSalesforceLoginUrl()}/services/oauth2/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: getRequiredEnv("SF_CLIENT_ID"),
        client_secret: getRequiredEnv("SF_CLIENT_SECRET"),
      }),
    }
  );

  const data = await response.json();

  if (!response.ok || !data?.access_token) {
    throw new SalesforceError(
      "Unable to authenticate with Salesforce.",
      response.status,
      data
    );
  }

  const expiresInMs = Number(data.expires_in) * 1000;
  const cacheDuration = Number.isFinite(expiresInMs) && expiresInMs > 30_000
    ? expiresInMs - 30_000
    : TOKEN_CACHE_FALLBACK_MS;
  cachedSalesforceToken = {
    accessToken: data.access_token as string,
    expiresAt: Date.now() + cacheDuration,
  };

  return cachedSalesforceToken.accessToken;
}

async function salesforceRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const token = await getSalesforceToken();
  const response = await fetch(
    `${getSalesforceInstanceUrl()}${path}`,
    {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
    }
  );

  if (response.status === 204) {
    return null as T;
  }

  const text = await response.text();
  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const arrayMessage =
      Array.isArray(data) &&
      typeof data[0] === "object" &&
      data[0] !== null &&
      "message" in data[0]
        ? String(data[0].message)
        : undefined;
    const objectMessage =
      typeof data === "object" &&
      data !== null &&
      "message" in data
        ? String(data.message)
        : undefined;
    const errorMessage =
      arrayMessage ||
      objectMessage ||
      "Salesforce request failed.";

    throw new SalesforceError(errorMessage, response.status, data);
  }

  return data as T;
}

export async function fetchSalesforceEventsForOwnerOnDate(
  dateKey: string,
  ownerId: string
) {
  const { start, end } = getDayBounds(dateKey);
  const query = `SELECT Id, Subject, StartDateTime, EndDateTime, Description, Location FROM Event
    WHERE StartDateTime <= ${end.toISOString()}
    AND EndDateTime >= ${start.toISOString()}
    AND OwnerId = '${ownerId}'`;

  const data = await salesforceRequest<{ records?: SalesforceEventRecord[] }>(
    `/services/data/${SALESFORCE_API_VERSION}/query?q=${encodeURIComponent(query)}`
  );

  return data.records ?? [];
}

type CreateSalesforceEventInput = {
  title: string;
  startDate: string;
  endDate: string;
  description?: string;
  location?: string;
  ownerId: string;
  whatId?: string;
};

export async function createSalesforceEvent(
  input: CreateSalesforceEventInput
) {
  const data = await salesforceRequest<{ id?: string }>(
    `/services/data/${SALESFORCE_API_VERSION}/sobjects/Event`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Subject: input.title,
        StartDateTime: input.startDate,
        EndDateTime: input.endDate,
        Description: input.description,
        Location: input.location,
        OwnerId: input.ownerId,
        WhatId: input.whatId,
      }),
    }
  );

  if (!data?.id) {
    throw new SalesforceError(
      "Salesforce did not return a new event id.",
      502,
      data
    );
  }

  return data.id;
}

export async function deleteSalesforceEvent(eventId: string) {
  await salesforceRequest<void>(
    `/services/data/${SALESFORCE_API_VERSION}/sobjects/Event/${eventId}`,
    { method: "DELETE" }
  );
}

const WORK_SCHEDULE_DAYS = {
  MON: { name: "Monday", shortName: "Mon", weekday: 1 },
  TUE: { name: "Tuesday", shortName: "Tue", weekday: 2 },
  WED: { name: "Wednesday", shortName: "Wed", weekday: 3 },
  THU: { name: "Thursday", shortName: "Thur", weekday: 4 },
  FRI: { name: "Friday", shortName: "Fri", weekday: 5 },
  SAT: { name: "Saturday", shortName: "Sat", weekday: 6 },
  SUN: { name: "Sunday", shortName: "Sun", weekday: 0 },
} as const;

const SALESFORCE_TRANSPORTATION: Record<string, string> = {
  WALK: "Walk",
  BIKE: "Bike",
  OWN_CAR: "Own Vehicle",
  RIDE: "Rides",
};

function formatScheduleTime(value: string) {
  const match = /^(?:([01]\d|2[0-3])):([0-5]\d)$/.exec(value);
  if (!match) {
    throw new Error(`Invalid work schedule time: ${value}`);
  }

  const hour = Number(match[1]);
  const displayHour = hour % 12 || 12;
  const displayTime = `${displayHour}:${match[2]} ${hour < 12 ? "AM" : "PM"}`;

  return { displayTime, hour, minute: match[2] };
}

function firstOccurrenceOnOrAfter(date: Date, weekday: number) {
  const dateOnly = date.toISOString().slice(0, 10);
  const [year, month, day] = dateOnly.split("-").map(Number);
  const anchor = new Date(Date.UTC(year, month - 1, day));
  const dayOffset = (weekday - anchor.getUTCDay() + 7) % 7;
  anchor.setUTCDate(anchor.getUTCDate() + dayOffset);
  return anchor.toISOString().slice(0, 10);
}

export async function createSalesforceWorkSchedule(
  schedule: SalesforceWorkScheduleInput,
  contactId: string
) {
  if (!isValidSalesforceId(contactId)) {
    throw new Error("Invalid Salesforce Contact ID.");
  }

  const transportation = SALESFORCE_TRANSPORTATION[schedule.transportation];
  if (!transportation) {
    throw new Error(`Unsupported Salesforce transportation value: ${schedule.transportation}`);
  }

  const payload: Record<string, string | boolean> = {
    Contact__c: contactId,
    First_Day__c: schedule.weekOf.toISOString().slice(0, 10),
    Frequency__c: "Weekly",
    Transportation__c: transportation,
  };

  if (schedule.employerName) payload.Employer_s__c = schedule.employerName;
  if (schedule.employerLocation) payload.Employer_Location__c = schedule.employerLocation;
  if (schedule.estimatedTravelTime) payload.Travel_Time__c = schedule.estimatedTravelTime;
  if (schedule.commentsNotes?.trim()) payload.Comments__c = schedule.commentsNotes.trim();

  for (const day of schedule.days) {
    const mapping = WORK_SCHEDULE_DAYS[day.dayOfWeek as keyof typeof WORK_SCHEDULE_DAYS];
    if (!mapping) {
      throw new Error(`Unsupported work schedule day: ${day.dayOfWeek}`);
    }

    const startTime = day.startTime?.trim() || null;
    const endTime = day.endTime?.trim() || null;
    if (Boolean(startTime) !== Boolean(endTime)) {
      throw new Error(`${mapping.name} requires both a start and end time.`);
    }

    const isScheduled = Boolean(startTime && endTime);
    payload[`${mapping.name}__c`] = isScheduled;
    if (!isScheduled) continue;

    const start = formatScheduleTime(startTime!);
    const end = formatScheduleTime(endTime!);
    const workDate = firstOccurrenceOnOrAfter(schedule.weekOf, mapping.weekday);
    payload[`${mapping.name}_Hours__c`] = `${start.displayTime} to ${end.displayTime}`;
    payload[`${mapping.shortName}_Start__c`] = `${workDate}T${start.hour.toString().padStart(2, "0")}:${start.minute}:00-06:00`;
    payload[`${mapping.shortName}_End__c`] = `${workDate}T${end.hour.toString().padStart(2, "0")}:${end.minute}:00-06:00`;
  }

  const fields = Object.keys(payload);
  const query = `SELECT Id, ${fields.join(", ")} FROM Work_Schedule__c
    WHERE Contact__c = '${contactId}'
    AND First_Day__c = ${payload.First_Day__c}
    AND Frequency__c = 'Weekly'`;
  const existingRecords = await salesforceRequest<{
    records?: Record<string, unknown>[];
  }>(`/services/data/${WORK_SCHEDULE_API_VERSION}/query?q=${encodeURIComponent(query)}`);
  const existingRecord = existingRecords.records?.find(record =>
    Object.entries(payload).every(([field, expected]) => {
      const actual = record[field];
      if (
        typeof expected === "string" &&
        (field.endsWith("_Start__c") || field.endsWith("_End__c"))
      ) {
        return typeof actual === "string" && Date.parse(actual) === Date.parse(expected);
      }
      return actual === expected;
    })
  );

  if (typeof existingRecord?.Id === "string") {
    return existingRecord.Id;
  }

  const data = await salesforceRequest<{ id?: string }>(
    `/services/data/${WORK_SCHEDULE_API_VERSION}/sobjects/Work_Schedule__c`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!data?.id) {
    throw new SalesforceError("Salesforce did not return a new work schedule id.", 502, data);
  }

  return data.id;
}
