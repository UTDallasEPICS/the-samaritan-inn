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
    select: { email: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Caseworker not found." }, { status: 404 });
  }

  const accountError = await checkLinkableAccount(parsed.data.userId);
  if (accountError) {
    return NextResponse.json({ error: accountError }, { status: 400 });
  }

  try {
    const caseworker = await prisma.$transaction(async (tx) => {
      // Assignments are linked by email, so they follow an email change.
      if (existing.email !== parsed.data.email) {
        await tx.caseworkerAssignment.updateMany({
          where: { caseworkerEmail: existing.email },
          data: { caseworkerEmail: parsed.data.email },
        });
      }
      return tx.caseworker.update({
        where: { id },
        data: parsed.data,
        select: adminCaseworkerSelect,
      });
    });
    return NextResponse.json(caseworker);
  } catch (error) {
    if (isLinkedAccountViolation(error)) {
      return NextResponse.json(
        { error: "That login account is already linked to another caseworker." },
        { status: 409 }
      );
    }
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        {
          error:
            "That email is already used by another caseworker or assignment.",
        },
        { status: 409 }
      );
    }
    console.error("admin caseworkers PUT error:", error);
    return NextResponse.json(
      { error: "Unable to save caseworker." },
      { status: 500 }
    );
  }
}

/** Removes the caseworker and their resident assignments together. */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkAdmin(request);
  if (denied) return denied;

  const { id } = await params;

  const existing = await prisma.caseworker.findUnique({
    where: { id },
    select: { email: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Caseworker not found." }, { status: 404 });
  }

  try {
    await prisma.$transaction([
      prisma.caseworkerAssignment.deleteMany({
        where: { caseworkerEmail: existing.email },
      }),
      prisma.caseworker.delete({ where: { id } }),
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("admin caseworkers DELETE error:", error);
    return NextResponse.json(
      { error: "Unable to delete caseworker." },
      { status: 500 }
    );
  }
}
