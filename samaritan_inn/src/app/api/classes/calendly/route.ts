import { NextRequest, NextResponse } from "next/server";
import { can } from "@/lib/permissions";
import { getServerSessionInfo } from "@/lib/getServerSessionInfo";
import { checkCalendlyUrl } from "@/lib/calendly-url";
import { getCalendlyUrl, setCalendlyUrl } from "@/lib/app-settings";

/** The Calendly link shown on /classes. Any logged-in user may read it. */
export async function GET(request: NextRequest) {
  const session = await getServerSessionInfo(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json({ url: await getCalendlyUrl() });
  } catch (error) {
    console.error("classes/calendly GET error:", error);
    return NextResponse.json(
      { error: "Unable to load the Calendly link." },
      { status: 500 }
    );
  }
}

/** Changes the Calendly link. Admins only (MANAGE_CLASSES). */
export async function PUT(request: NextRequest) {
  const session = await getServerSessionInfo(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!can(session.role, "MANAGE_CLASSES")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { url?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  if (typeof body.url !== "string") {
    return NextResponse.json({ error: "Enter the Calendly link." }, { status: 400 });
  }

  const checked = checkCalendlyUrl(body.url);
  if ("error" in checked) {
    return NextResponse.json({ error: checked.error }, { status: 400 });
  }

  try {
    return NextResponse.json({ url: await setCalendlyUrl(checked.value) });
  } catch (error) {
    console.error("classes/calendly PUT error:", error);
    return NextResponse.json(
      { error: "Unable to save the Calendly link." },
      { status: 500 }
    );
  }
}
