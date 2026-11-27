import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSessionInfo } from "@/lib/getServerSessionInfo";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { isActiveSalesforceUsername } from "@/lib/salesforce";

async function requireStaff(request: NextRequest) {
  const session = await getServerSessionInfo(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!can(session.role, "EDIT_OWN_SALESFORCE_USERNAME")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session.id;
}

export async function GET(request: NextRequest) {
  const userId = await requireStaff(request);
  if (typeof userId !== "string") return userId;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { salesforceUsername: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error("users/me GET error:", error);
    return NextResponse.json(
      { error: "Unable to load your Salesforce username." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const userId = await requireStaff(request);
  if (typeof userId !== "string") return userId;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const username = (body as Record<string, unknown>).salesforceUsername;
  if (typeof username !== "string") {
    return NextResponse.json(
      { error: "Salesforce username must be text." },
      { status: 400 }
    );
  }
  const normalizedUsername = username.trim() || null;
  if (normalizedUsername && normalizedUsername.length > 255) {
    return NextResponse.json(
      { error: "Salesforce username must be 255 characters or fewer." },
      { status: 400 }
    );
  }

  if (normalizedUsername) {
    let isValid: boolean;
    try {
      isValid = await isActiveSalesforceUsername(normalizedUsername);
    } catch (error) {
      console.error("Salesforce username validation failed:", error);
      return NextResponse.json(
        { error: "Unable to validate this username with Salesforce. Please try again." },
        { status: 502 }
      );
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "No active Salesforce user was found with that username." },
        { status: 422 }
      );
    }
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { salesforceUsername: normalizedUsername },
      select: { salesforceUsername: true },
    });
    return NextResponse.json(user);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "That Salesforce username is already assigned to another user." },
        { status: 409 }
      );
    }
    console.error("users/me PATCH error:", error);
    return NextResponse.json(
      { error: "Unable to save your Salesforce username." },
      { status: 500 }
    );
  }
}
