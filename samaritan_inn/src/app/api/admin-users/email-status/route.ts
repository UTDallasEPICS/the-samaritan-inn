import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSessionInfo } from '@/lib/getServerSessionInfo';
import { can } from '@/lib/permissions';
import type { NextRequest } from 'next/server';

// Admin-only: when each user confirmed their email (first password set from an emailed
// link), or null if they haven't. Used by the Manage Users page (/admin-users).
export async function GET(request: NextRequest) {
  const session = await getServerSessionInfo(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!can(session.role, 'MANAGE_USERS')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const users = await prisma.user.findMany({ select: { id: true, emailVerified: true } });
  return NextResponse.json(
    Object.fromEntries(users.map((u) => [u.id, u.emailVerified?.toISOString() ?? null]))
  );
}
