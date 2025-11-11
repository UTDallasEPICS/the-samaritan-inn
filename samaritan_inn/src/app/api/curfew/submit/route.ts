import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("📩 Incoming curfew request:", body);

    const {
      caseWorker,
      startDate,
      startTime,
      endDate,
      endTime,
      reason,
      extraInfo,
      choreCoverage,
      signature,
    } = body;

    // ✅ Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Create new curfew extension record
    const request = await prisma.curfewExtension.create({
      data: {
        userId: user.id, // ✅ This fixes the missing user argument
        caseWorker,
        startDate: new Date(startDate),
        startTime,
        endDate: new Date(endDate),
        endTime,
        reason,
        extraInfo,
        choreCoverage,
        signature,
      },
    });

    console.log("✅ Curfew request saved:", request);

    // Optionally notify admin (placeholder for now)
    const admin = await prisma.user.findFirst({
      where: {
        role: "admin",
        name: caseWorker,
      },
    });

    if (admin) {
      console.log(`🔔 Notify admin (${admin.email}) about new curfew request.`);
    }

    return NextResponse.json({ success: true, request });
  } catch (err) {
    console.error("Error submitting curfew request:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
