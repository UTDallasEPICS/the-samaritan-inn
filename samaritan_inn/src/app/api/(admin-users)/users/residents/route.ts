import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() ?? '';
  const residents = await prisma.user.findMany({
    where: {
      role: 'resident',
      ...(q ? { name: { contains: q } } : {}),
    },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
    take: 10,
  });
  return NextResponse.json(residents);
}
