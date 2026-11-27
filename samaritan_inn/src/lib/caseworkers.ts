/**
 * Server-only source of caseworker data.
 *
 * Today every caseworker is a Salesforce User. This file is the only place that
 * knows that: when the shelter moves to Outlook / Microsoft Graph, rewrite the
 * body of getCaseworkerProfiles() (Graph `GET /users/{email}` returns
 * displayName, jobTitle, mail, businessPhones) and nothing that calls it changes.
 *
 * Do not import this from client components — it reads server-side secrets.
 */
import { fetchSalesforceUsers, isValidSalesforceId } from "@/lib/salesforce";

export type CaseworkerProfile = {
  /** Salesforce User id; also the calendar "ownerId" used for booking. */
  id: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
};

/**
 * The caseworkers residents are allowed to book with, configured per
 * environment. Only ids live here — names and contact details come from
 * Salesforce, so changing a caseworker's details never needs a code change.
 */
export function getConfiguredCaseworkerOwnerIds(): string[] {
  const ids = [
    process.env.NEXT_PUBLIC_SF_OWNER_1,
    process.env.NEXT_PUBLIC_SF_OWNER_2,
    process.env.NEXT_PUBLIC_SF_OWNER_3,
  ].filter((id): id is string => Boolean(id && isValidSalesforceId(id)));

  return [...new Set(ids)];
}

/**
 * Salesforce ids come in a 15-character form and an 18-character form (the
 * last 3 are a checksum). The first 15 characters identify the record.
 */
export function isSameCaseworkerId(a: string, b: string) {
  return a.slice(0, 15) === b.slice(0, 15);
}

export function isBookableCaseworker(ownerId: string) {
  return getConfiguredCaseworkerOwnerIds().some((id) =>
    isSameCaseworkerId(id, ownerId)
  );
}

export async function getCaseworkerProfiles(options: {
  ids?: string[];
  emails?: string[];
}): Promise<CaseworkerProfile[]> {
  const records = await fetchSalesforceUsers(options);

  return records.map((record) => ({
    id: record.Id,
    name: record.Name,
    title: record.Title || null,
    email: record.Email || null,
    // Some caseworkers only have a mobile number on file.
    phone: record.Phone || record.MobilePhone || null,
  }));
}

export function findCaseworker(
  profiles: CaseworkerProfile[],
  ownerId: string | null | undefined
) {
  if (!ownerId) return undefined;
  return profiles.find((profile) => isSameCaseworkerId(profile.id, ownerId));
}
