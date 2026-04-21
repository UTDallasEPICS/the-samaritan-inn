import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerUserId } from '@/lib/getServerUserId';
import type { NextRequest } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      residentName,
      room,
      employmentStatus,
      employerName,
      employerLocation,
      weekOf,
      transportation,
      estimatedTravelTime,
      residentSignature,
      signatureDate
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (
      employmentStatus == null ||
      employmentStatus == undefined ||
      !employerName?.trim() ||
      !weekOf?.trim() ||
      transportation == null ||
      transportation == undefined ||
      !residentSignature?.trim()
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const weekOfDate = new Date(weekOf);
    const monthOf = weekOfDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const request = await prisma.workSchedule.create({
      data: {
        userId,
        residentName,
        room: room || '',
        employmentStatus,
        employerName,
        employerLocation: employerLocation || null,
        weekOf: weekOfDate,
        monthOf,
        transportation,
        estimatedTravelTime: estimatedTravelTime || '',
        residentSignature,
        signatureDate: new Date(signatureDate)
      },
    });
    
    return NextResponse.json(request);
  } catch (error) {
    console.error('Error creating extended curfew request:', error);
    return NextResponse.json({ error: 'Failed to submit request', detail: String(error) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const userId = await getServerUserId(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const schedules = await prisma.workSchedule.findMany({
      where: {
        userId,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching work schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work schedules' },
      { status: 500 }
    );
  }
}