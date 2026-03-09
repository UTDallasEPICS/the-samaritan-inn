import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      todayDate,
      residentName,
      datesNeeded,
      expectedReturnTime,
      isOngoing,
      reason,
      choreCoveredBy,
      choreCoverageSignature,
      residentSignature,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 400 });
    }

    const request = await prisma.extendedCurfewRequest.create({
      data: {
        userId,
        todayDate: new Date(todayDate),
        residentName,
        datesNeeded,
        expectedReturnTime,
        isOngoing,
        reason,
        choreCoveredBy: choreCoveredBy || null,
        choreCoverageSignature: choreCoverageSignature || null,
        residentSignature,
      },
    });

    return NextResponse.json(request);
  } catch (error) {
    console.error('Error creating extended curfew request:', error);
    return NextResponse.json({ error: 'Failed to submit request', detail: String(error) }, { status: 500 });
  }
}

export async function GET() {
  const data = await prisma.extendedCurfewRequest.findMany();
  return Response.json(data);
}