/**
 * Server-only site settings that admins change in the app (AppSetting table).
 * Do not import this from client components.
 */
import { prisma } from "@/lib/db/prisma";
import { DEFAULT_CALENDLY_URL } from "@/lib/settings/calendly-url";

const CALENDLY_URL_KEY = "classes.calendlyUrl";

/** The Calendly page shown on /classes; the default until an admin saves one. */
export async function getCalendlyUrl() {
  const setting = await prisma.appSetting.findUnique({
    where: { key: CALENDLY_URL_KEY },
    select: { value: true },
  });
  return setting?.value ?? DEFAULT_CALENDLY_URL;
}

/** Saves an already-validated Calendly link (see checkCalendlyUrl). */
export async function setCalendlyUrl(url: string) {
  await prisma.appSetting.upsert({
    where: { key: CALENDLY_URL_KEY },
    create: { key: CALENDLY_URL_KEY, value: url },
    update: { value: url },
  });
  return url;
}
