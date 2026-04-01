import { prisma } from '@/lib/prisma';
import { EmploymentStatus, Transportation } from '@prisma/client';
import { NextResponse } from 'next/server';

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

    const request = await prisma.workSchedule.create({
      data: {
        userId,
        residentName,
        room: room || null,
        employmentStatus: employmentStatus as EmploymentStatus,
        employerName,
        employerLocation: employerLocation || null,
        weekOf: new Date(weekOf),
        transportation: transportation as Transportation,
        estimatedTravelTime: estimatedTravelTime || null,
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

export async function GET() {
  try {
    const schedules = await prisma.workSchedule.findMany({
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