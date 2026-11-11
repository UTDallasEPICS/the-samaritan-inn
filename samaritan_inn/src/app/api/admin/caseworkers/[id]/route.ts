import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  adminCaseworkerSelect,
  checkAdmin,
  checkLinkableAccount,
  isLinkedAccountViolation,
  isUniqueViolation,
  parseCaseworkerInput,
} from "@/lib/caseworker-directory";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkAdmin(request);
  if (denied) return denied;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = parseCaseworkerInput(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const existing = await prisma.caseworker.findUnique({
    where: { id },
    select: { updatedAt: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Empowerment Coach not found." }, { status: 404 });
  }

  // The admin form sends back the updatedAt it loaded. If the coach changed
  // their own details since (e.g. their Bookings link on the Profile
  // tab), saving would overwrite that change, so ask the admin to reload.
  const expectedUpdatedAt = (body as { expectedUpdatedAt?: unknown }).expectedUpdatedAt;
  if (
    typeof expectedUpdatedAt === "string" &&
    existing.updatedAt.getTime() !== Date.parse(expectedUpdatedAt)
  ) {
    return NextResponse.json(
      {
        error:
          "This Empowerment Coach was changed since you opened it. Reload the page to see the latest details.",
      },
      { status: 409 }
    );
  }

  const accountError = await checkLinkableAccount(parsed.data.userId);
  if (accountError) {
    return NextResponse.json({ error: accountError }, { status: 400 });
  }

  try {
    const caseworker = await prisma.caseworker.update({
      where: { id },
      data: parsed.data,
      select: adminCaseworkerSelect,
    });
    return NextResponse.json(caseworker);
  } catch (error) {
    if (isLinkedAccountViolation(error)) {
      return NextResponse.json(
        { error: "That login account is already linked to another Empowerment Coach." },
        { status: 409 }
      );
    }
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        {
          error:
            "That email is already used by another Empowerment Coach.",
        },
        { status: 409 }
      );
    }
    console.error("admin caseworkers PUT error:", error);
    return NextResponse.json(
      { error: "Unable to save Empowerment Coach." },
      { status: 500 }
    );
  }
}

/** Removes the coach from the directory. Their linked login account is kept. */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkAdmin(request);
  if (denied) return denied;

  const { id } = await params;

  const existing = await prisma.caseworker.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Empowerment Coach not found." }, { status: 404 });
  }

  try {
    await prisma.caseworker.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("admin caseworkers DELETE error:", error);
    return NextResponse.json(
      { error: "Unable to delete Empowerment Coach." },
      { status: 500 }
    );
  }
}
