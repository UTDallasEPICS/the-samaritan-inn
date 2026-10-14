import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  caseworkerSelect,
  checkAdmin,
  getCaseworkerSource,
  isUniqueViolation,
  parseCaseworkerInput,
} from "@/lib/caseworker-directory";

/**
 Everything the /admin-caseworkers page needs in one call: the caseworker
 directory, every resident ↔ caseworker assignment, and the residents that
  can be assigned.
 */
export async function GET(request: NextRequest) {
  const denied = await checkAdmin(request);
  if (denied) return denied;

  try {
    const [caseworkers, assignments, residents] = await Promise.all([
      prisma.caseworker.findMany({
        select: caseworkerSelect,
        orderBy: { name: "asc" },
      }),
      prisma.caseworkerAssignment.findMany({
        select: {
          id: true,
          caseworkerEmail: true,
          resident: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.user.findMany({
        where: { role: "resident" },
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return NextResponse.json({
      source: getCaseworkerSource(),
      caseworkers,
      assignments,
      residents,
    });
  } catch (error) {
    console.error("admin caseworkers GET error:", error);
    return NextResponse.json(
      { error: "Unable to load caseworkers." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const denied = await checkAdmin(request);
  if (denied) return denied;

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

  try {
    const caseworker = await prisma.caseworker.create({
      data: parsed.data,
      select: caseworkerSelect,
    });
    return NextResponse.json(caseworker, { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { error: "A caseworker with that email already exists." },
        { status: 409 }
      );
    }
    console.error("admin caseworkers POST error:", error);
    return NextResponse.json(
      { error: "Unable to save caseworker." },
      { status: 500 }
    );
  }
}
