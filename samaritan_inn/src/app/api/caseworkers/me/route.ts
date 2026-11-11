import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/permissions";
import { getServerSessionInfo } from "@/lib/getServerSessionInfo";
import {
  caseworkerSelect,
  connectOwnProfile,
  getOwnCaseworkerView,
  parseCaseworkerSelfInput,
  ProfileConnectError,
} from "@/lib/caseworker-directory";

/** Returns the coach's user id, or a JSON error response. */
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
 * The logged-in Empowerment Coach's own profile. `profile` is null until the
 * coach first saves their details (see PATCH) or an admin links this account
 * on /admin-empowerment-coaches.
 */
export async function GET(request: NextRequest) {
  const userId = await requireCaseworker(request);
  if (typeof userId !== "string") return userId;

  try {
    const view = await getOwnCaseworkerView(userId);
    return NextResponse.json(view ?? { profile: null });
  } catch (error) {
    console.error("caseworkers/me GET error:", error);
    return NextResponse.json(
      { error: "Unable to load your Empowerment Coach profile." },
      { status: 500 }
    );
  }
}

/**
 * Updates only the fields a coach may edit themselves. Used by both the
 * Profile tab and the /appointments card, so they always save the same link.
 * The first save links or creates the coach's profile automatically.
 */
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
    const id = await connectOwnProfile(userId);
    const profile = await prisma.caseworker.update({
      where: { id },
      data: parsed.data,
      select: caseworkerSelect,
    });
    return NextResponse.json(profile);
  } catch (error) {
    if (error instanceof ProfileConnectError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("caseworkers/me PATCH error:", error);
    return NextResponse.json(
      { error: "Unable to save your profile." },
      { status: 500 }
    );
  }
}
