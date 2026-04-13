import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerUserId } from '@/lib/getServerUserId';

export async function GET(request: NextRequest) {
  const userId = await getServerUserId(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Delete events older than 30 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  await prisma.scheduledEvent.deleteMany({
    where: { endTime: { lt: cutoff } },
  });

  const events = await prisma.scheduledEvent.findMany({
    where: { userId },
    orderBy: { startTime: 'asc' },
  });

  return NextResponse.json(events);
}
