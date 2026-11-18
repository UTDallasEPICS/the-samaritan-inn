import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSessionInfo } from '@/lib/getServerSessionInfo';
import { can, isRole } from '@/lib/permissions';
import type { NextRequest } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await getServerSessionInfo(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!can(session.role, 'MANAGE_USERS')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let role: unknown;
  try {
    ({ role } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (!isRole(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (!target) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Never leave the site without an admin. Only admins can change roles, so blocking
  // self-demotion is enough: demoting another admin means at least two exist.
  if (id === session.id && target.role === 'admin' && role !== 'admin') {
    return NextResponse.json(
      { error: "You can't remove your own admin role. Ask another admin to do it." },
      { status: 409 }
    );
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });
  return NextResponse.json(updated);
}
