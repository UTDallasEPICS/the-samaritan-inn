import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  adminCaseworkerSelect,
  checkAdmin,
  checkLinkableAccount,
  getCaseworkerSource,
  isLinkedAccountViolation,
  isUniqueViolation,
  parseCaseworkerInput,
} from "@/lib/caseworker-directory";

/**
 Everything the /admin-caseworkers page needs in one call: the caseworker
 directory, every resident ↔ caseworker assignment, the residents that
  can be assigned, and the caseworker login accounts profiles can be linked to.
 */
export async function GET(request: NextRequest) {
  const denied = await checkAdmin(request);
  if (denied) return denied;

  try {
    const [caseworkers, assignments, residents, accounts] = await Promise.all([
      prisma.caseworker.findMany({
        select: adminCaseworkerSelect,
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
      prisma.user.findMany({
        where: { role: "caseworker" },
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return NextResponse.json({
      source: getCaseworkerSource(),
      caseworkers,
      assignments,
      residents,
      accounts,
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

  const accountError = await checkLinkableAccount(parsed.data.userId);
  if (accountError) {
    return NextResponse.json({ error: accountError }, { status: 400 });
  }

  try {
    const caseworker = await prisma.caseworker.create({
      data: parsed.data,
      select: adminCaseworkerSelect,
    });
    return NextResponse.json(caseworker, { status: 201 });
  } catch (error) {
    if (isLinkedAccountViolation(error)) {
      return NextResponse.json(
        { error: "That login account is already linked to another caseworker." },
        { status: 409 }
      );
    }
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
