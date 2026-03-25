import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// TODO: Implement POST handler for WorkSchedule
export async function POST() {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
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