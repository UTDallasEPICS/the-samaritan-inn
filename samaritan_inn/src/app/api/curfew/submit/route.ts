import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const data = await req.json();

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
      userId,
    } = data;

    if (!caseWorker || !startDate || !endDate || !startTime || !endTime || !reason || !signature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const request = await prisma.curfewExtension.create({
      data: {
        caseWorker,
        startDate: new Date(startDate),
        startTime,
        endDate: new Date(endDate),
        endTime,
        reason,
        extraInfo,
        choreCoverage,
        signature,
        userId,
      },
    });

    return NextResponse.json({ message: "Request submitted", request }, { status: 201 });
  } catch (error) {
    console.error("Error submitting curfew request:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
