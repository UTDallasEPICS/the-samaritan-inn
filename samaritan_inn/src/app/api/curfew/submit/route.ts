import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
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
      },
    });

    return NextResponse.json({ success: true, saved });
  } catch (err) {
    console.error("Curfew submission error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
