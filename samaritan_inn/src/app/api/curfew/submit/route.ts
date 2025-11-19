import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/options";

export async function POST(req: Request) {
  console.log("=== Curfew Submit API Hit ===");

  // FIX: use our own copied NextAuth options
  const session = await getServerSession(authOptions);

  console.log("SESSION VALUE:", session);

  if (!session?.user?.id) {
    console.log("AUTH ERROR ➜ session.user.id missing");
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  try {
    const body = await req.json();
    const {
      caseWorker,
      startDate,
      endDate,
      startTime,
      endTime,
      reason,
      signature
    } = body;

    const saved = await prisma.curfewExtension.create({
      data: {
        userId,
        caseWorker,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        startTime,
        endTime,
        reason,
        signature
      }
    });

    return NextResponse.json({ success: true, saved });
  } catch (err) {
    console.error("Curfew submission error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
