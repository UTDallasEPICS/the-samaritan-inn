import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      todayDate,
      residentName,
      assignedCaseworkerId,
      datesNeeded,
      expectedReturnTime,
      isOngoing,
      reason,
      choreCoveredById,
      choreCoverageSignature,
      residentSignature,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (
      !datesNeeded?.trim() ||
      !expectedReturnTime?.trim() ||
      isOngoing === null ||
      isOngoing === undefined ||
      !reason?.trim() ||
      !residentSignature?.trim()
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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
        choreCoveredById: choreCoveredById || null,
        choreCoverageSignature: choreCoverageSignature || null,
        residentSignature,
        assignedCaseworkerId: assignedCaseworkerId || null,
      },
    });

    return NextResponse.json(request);
  } catch (error) {
    console.error('Error creating extended curfew request:', error);
    return NextResponse.json({ error: 'Failed to submit request', detail: String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const requests = await prisma.extendedCurfewRequest.findMany({
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching extended curfew requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}