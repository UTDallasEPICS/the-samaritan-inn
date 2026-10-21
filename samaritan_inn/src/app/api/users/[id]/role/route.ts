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

  try {
    const { role } = await req.json();
    if (!isRole(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // An admin who changes their own role loses access to this page at once,
    // so another admin has to do it. This also means the last admin can never
    // be demoted: whoever demotes an admin is an admin too.
    if (id === session.id) {
      return NextResponse.json(
        { error: "You can't change your own role. Ask another admin." },
        { status: 403 }
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update role', detail: String(error) }, { status: 500 });
  }
}
