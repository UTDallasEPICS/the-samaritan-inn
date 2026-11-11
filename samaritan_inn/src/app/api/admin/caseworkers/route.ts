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
 Everything the /admin-empowerment-coaches page needs in one call: the coach
 directory and the coach login accounts profiles can be linked to.
 */
export async function GET(request: NextRequest) {
  const denied = await checkAdmin(request);
  if (denied) return denied;

  try {
    const [caseworkers, accounts] = await Promise.all([
      prisma.caseworker.findMany({
        select: adminCaseworkerSelect,
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
      accounts,
    });
  } catch (error) {
    console.error("admin caseworkers GET error:", error);
    return NextResponse.json(
      { error: "Unable to load Empowerment Coaches." },
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
        { error: "That login account is already linked to another Empowerment Coach." },
        { status: 409 }
      );
    }
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { error: "An Empowerment Coach with that email already exists." },
        { status: 409 }
      );
    }
    console.error("admin caseworkers POST error:", error);
    return NextResponse.json(
      { error: "Unable to save Empowerment Coach." },
      { status: 500 }
    );
  }
}
