import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/permissions";
import { getServerSessionInfo } from "@/lib/getServerSessionInfo";
import {
  caseworkerSelect,
  getOwnCaseworkerView,
  parseCaseworkerSelfInput,
} from "@/lib/caseworker-directory";

/** Returns the caseworker's user id, or a JSON error response. */
async function requireCaseworker(request: NextRequest) {
  const session = await getServerSessionInfo(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!can(session.role, "EDIT_OWN_COACH_PROFILE")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session.id;
}

/**
 * The logged-in caseworker's profile and assigned residents. `profile` is null
 * until an admin links this account to a caseworker on /admin-caseworkers.
 */
export async function GET(request: NextRequest) {
  const userId = await requireCaseworker(request);
  if (typeof userId !== "string") return userId;

  try {
    const view = await getOwnCaseworkerView(userId);
    return NextResponse.json(view ?? { profile: null, residents: [] });
  } catch (error) {
    console.error("caseworkers/me GET error:", error);
    return NextResponse.json(
      { error: "Unable to load your caseworker profile." },
      { status: 500 }
    );
  }
}

/** Updates only the fields a caseworker may edit themselves. */
export async function PATCH(request: NextRequest) {
  const userId = await requireCaseworker(request);
  if (typeof userId !== "string") return userId;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = parseCaseworkerSelfInput(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const profile = await prisma.caseworker.update({
      where: { userId },
      data: parsed.data,
      select: caseworkerSelect,
    });
    return NextResponse.json(profile);
  } catch (error) {
    // P2025: no profile is linked to this account.
    if ((error as { code?: string })?.code === "P2025") {
      return NextResponse.json(
        { error: "Your account isn't linked to a caseworker profile yet." },
        { status: 404 }
      );
    }
    console.error("caseworkers/me PATCH error:", error);
    return NextResponse.json(
      { error: "Unable to save your profile." },
      { status: 500 }
    );
  }
}
