import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSessionInfo } from '@/lib/getServerSessionInfo';
import { can } from '@/lib/permissions';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const session = await getServerSessionInfo(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!can(session.role, 'MANAGE_USERS')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(users);
}
