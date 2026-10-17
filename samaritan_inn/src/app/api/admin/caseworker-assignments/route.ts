import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdmin, isUniqueViolation } from "@/lib/caseworker-directory";

/** Assigns a resident to a caseworker from the in-app directory. */
export async function POST(request: NextRequest) {
  const denied = await checkAdmin(request);
  if (denied) return denied;

  let body: { residentId?: unknown; caseworkerId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (typeof body.residentId !== "string" || typeof body.caseworkerId !== "string") {
    return NextResponse.json(
      { error: "residentId and caseworkerId are required." },
      { status: 400 }
    );
  }

  const [resident, caseworker] = await Promise.all([
    prisma.user.findUnique({
      where: { id: body.residentId },
      select: { id: true, role: true },
    }),
    prisma.caseworker.findUnique({
      where: { id: body.caseworkerId },
      select: { email: true },
    }),
  ]);

  if (!resident || resident.role !== "resident") {
    return NextResponse.json({ error: "Resident not found." }, { status: 404 });
  }
  if (!caseworker) {
    return NextResponse.json({ error: "Caseworker not found." }, { status: 404 });
  }

  try {
    const assignment = await prisma.caseworkerAssignment.create({
      data: { residentId: resident.id, caseworkerEmail: caseworker.email },
      select: {
        id: true,
        caseworkerEmail: true,
        resident: { select: { id: true, name: true, email: true } },
      },
    });
    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { error: "That resident is already assigned to this caseworker." },
        { status: 409 }
      );
    }
    console.error("admin caseworker-assignments POST error:", error);
    return NextResponse.json(
      { error: "Unable to save assignment." },
      { status: 500 }
    );
  }
}
