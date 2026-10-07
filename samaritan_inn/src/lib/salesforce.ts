import { getDayBounds } from "@/lib/booking";

const SALESFORCE_API_VERSION = "v59.0";
const SALESFORCE_ID_PATTERN = /^[a-zA-Z0-9]{15,18}$/;

export type SalesforceEventRecord = {
  Id?: string;
  StartDateTime: string;
  EndDateTime: string;
  Subject?: string;
  Description?: string | null;
  Location?: string | null;
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
  const response = await fetch(
    `${getRequiredEnv("SF_LOGIN_URL")}/services/oauth2/token`,
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

  return data.access_token as string;
}

async function salesforceRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const token = await getSalesforceToken();
  const response = await fetch(
    `${getRequiredEnv("SF_INSTANCE_URL")}${path}`,
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

export type SalesforceUserRecord = {
  Id: string;
  Name: string;
  Email: string | null;
  Phone: string | null;
  MobilePhone: string | null;
  Title: string | null;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// SOQL string literals escape backslashes and single quotes with a backslash.
function escapeSoqlString(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

/**
 * Active Salesforce users matching any of the given ids or emails.
 * Inputs are validated/escaped before being placed in the query.
 */
export async function fetchSalesforceUsers(options: {
  ids?: string[];
  emails?: string[];
}) {
  const ids = (options.ids ?? []).filter(isValidSalesforceId);
  const emails = (options.emails ?? [])
    .map((email) => email.trim())
    .filter((email) => EMAIL_PATTERN.test(email));

  const conditions: string[] = [];
  if (ids.length > 0) {
    conditions.push(`Id IN (${ids.map((id) => `'${id}'`).join(", ")})`);
  }
  if (emails.length > 0) {
    conditions.push(
      `Email IN (${emails.map((email) => `'${escapeSoqlString(email)}'`).join(", ")})`
    );
  }

  if (conditions.length === 0) {
    return [];
  }

  const query = `SELECT Id, Name, Email, Phone, MobilePhone, Title FROM User
    WHERE IsActive = true AND (${conditions.join(" OR ")})`;

  const data = await salesforceRequest<{ records?: SalesforceUserRecord[] }>(
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
