import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSessionInfo } from '@/lib/getServerSessionInfo';
import type { NextRequest } from 'next/server';

interface DayInput {
  dayOfWeek: string;
  startTime?: string | null;
  endTime?: string | null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      residentName,
      assignedCaseworkerId,
      room,
      employmentStatus,
      employerName,
      employerLocation,
      weekOf,
      transportation,
      estimatedTravelTime,
      residentSignature,
      signatureDate,
      days,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (
      employmentStatus == null ||
      !weekOf?.trim() ||
      transportation == null ||
      !residentSignature?.trim()
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (employmentStatus === 'EMPLOYED' && !employerName?.trim()) {
      return NextResponse.json({ error: 'Employer name required when employed' }, { status: 400 });
    }

    const weekOfDate = new Date(weekOf);
    const monthOf = weekOfDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const dayRows = Array.isArray(days)
      ? (days as DayInput[]).map(d => ({
          dayOfWeek: d.dayOfWeek,
          startTime: d.startTime || null,
          endTime: d.endTime || null,
        }))
      : [];

    const schedule = await prisma.workSchedule.create({
      data: {
        userId,
        residentName,
        assignedCaseworkerId: assignedCaseworkerId || null,
        room: room || '',
        employmentStatus,
        employerName: employerName || null,
        employerLocation: employerLocation || null,
        weekOf: weekOfDate,
        monthOf,
        transportation,
        estimatedTravelTime: estimatedTravelTime || '',
        residentSignature,
        signatureDate: new Date(signatureDate),
        days: dayRows.length ? { create: dayRows } : undefined,
      },
      include: { days: true },
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error creating work schedule:', error);
    return NextResponse.json({ error: 'Failed to submit request', detail: String(error) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSessionInfo(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const schedules = await prisma.workSchedule.findMany({
      where: session.role === 'admin' ? undefined : { userId: session.id },
      orderBy: { submittedAt: 'desc' },
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
