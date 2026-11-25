/**
 * Validation for caseworker profile fields, shared by the browser (to check a
 * field before saving) and the server (src/lib/caseworker-directory.ts), so
 * both always apply the same rules. No server-only imports here.
 */

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

export const FIELD_MAX_LENGTH = {
  phone: 50,
  availability: 200,
  bookingUrl: 2000,
} as const;

/** Digits plus the usual separators, e.g. "(214) 555-0100 ext. 12". */
const PHONE_PATTERN = /^[0-9+().\-\s]+(\s*(x|ext\.?)\s*[0-9]+)?$/i;

/**
 * Returns the normalized booking link, or an error message. Empty input is
 * allowed and means "no link".
 */
export function checkBookingUrl(
  value: string
): { value: string | null } | { error: string } {
  const trimmed = value.trim();
  if (!trimmed) return { value: null };
  if (trimmed.length > FIELD_MAX_LENGTH.bookingUrl) {
    return { error: "Booking link is too long." };
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { error: "Booking link must be a full URL starting with https://." };
  }

  if (url.protocol !== "https:" || !BOOKINGS_HOSTS.has(url.hostname)) {
    return {
      error:
        "Booking link must be a Microsoft Bookings page (https://bookings.cloud.microsoft/... or https://outlook.office.com/...).",
    };
  }
  return { value: url.toString() };
}

/** Returns an error message for an invalid phone number, or null. Empty is allowed. */
export function checkPhone(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > FIELD_MAX_LENGTH.phone) {
    return `Phone must be ${FIELD_MAX_LENGTH.phone} characters or fewer.`;
  }
  const digits = trimmed.replace(/\D/g, "").length;
  if (!PHONE_PATTERN.test(trimmed) || digits < 7) {
    return "Enter a valid phone number, e.g. (214) 555-0100.";
  }
  return null;
}

/** Returns an error message for invalid availability text, or null. */
export function checkAvailability(value: string): string | null {
  if (value.trim().length > FIELD_MAX_LENGTH.availability) {
    return `Availability must be ${FIELD_MAX_LENGTH.availability} characters or fewer.`;
  }
  return null;
}
