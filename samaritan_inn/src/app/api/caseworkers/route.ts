import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      select: { id: true, name: true }
    });

    return NextResponse.json(admins);
  } catch (err) {
    console.error("Error loading case workers:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
