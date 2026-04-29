import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const caseworkers = await prisma.user.findMany({
    where: { role: { in: ['admin', 'case_worker'] } },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(caseworkers);
}
