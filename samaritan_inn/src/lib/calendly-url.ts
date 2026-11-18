/**
 * Validation for the Classes page's Calendly link, shared by the browser (to
 * check before saving) and the server (src/app/api/classes/calendly/route.ts),
 * so both always apply the same rule. No server-only imports here.
 */

/** Used until an admin saves a link on /classes. */
export const DEFAULT_CALENDLY_URL = "https://calendly.com/navi82singh00/new-meeting";

const MAX_LENGTH = 500;

/**
 * Returns the normalized link, or an error message. Only Calendly pages are
 * accepted, since the link is embedded on the page for every resident.
 */
export function checkCalendlyUrl(
  value: string
): { value: string } | { error: string } {
  const trimmed = value.trim();
  if (!trimmed) return { error: "Enter the Calendly link." };
  if (trimmed.length > MAX_LENGTH) return { error: "Calendly link is too long." };

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { error: "Calendly link must be a full URL starting with https://." };
  }

  const isCalendly =
    url.hostname === "calendly.com" || url.hostname.endsWith(".calendly.com");
  if (url.protocol !== "https:" || !isCalendly || url.pathname === "/") {
    return {
      error: "Calendly link must be a Calendly page, e.g. https://calendly.com/your-name/event.",
    };
  }
  return { value: url.toString() };
}
