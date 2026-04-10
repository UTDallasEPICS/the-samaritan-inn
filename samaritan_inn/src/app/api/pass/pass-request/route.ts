import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('API /api/pass/pass-request received body:', body);
    const {
      userId,
      residentName,
      assignedCaseworkerId,
      todayDate,
      datesRequested,
      reason,
      choreCoveredById,
      choreCoverageSignature,
      signatureDate,
      residentSignature,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (
      !datesRequested?.trim() ||
      !reason?.trim() ||
      !residentSignature?.trim()
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const request = await prisma.passRequest.create({
      data: {
        userId,
        todayDate: new Date(todayDate),
        residentName,
        datesRequested,
        reason,
        choreCoveredById: choreCoveredById || null,
        choreCoverageSignature: choreCoverageSignature || null,
        signatureDate: new Date(todayDate),
        residentSignature,
        assignedCaseworkerId: assignedCaseworkerId || null,
      },
    });

    return NextResponse.json(request);
  } catch (error) {
    console.error('Error creating pass request:', error);
    return NextResponse.json({ error: 'Failed to submit request', detail: String(error) }, { status: 500 });
  }
}


export async function GET() {
  try {
    const requests = await prisma.passRequest.findMany({
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching pass requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}