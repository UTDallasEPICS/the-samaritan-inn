import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSessionInfo } from '@/lib/getServerSessionInfo';
import { can } from '@/lib/permissions';
import { sendAccountSetupEmail } from '@/lib/passwordReset';
import type { NextRequest } from 'next/server';

// Admin-only: re-send the "create your password" email, e.g. when the first link
// expired or the resident lost it. Issuing it replaces any earlier link for that account.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSessionInfo(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!can(session.role, 'MANAGE_USERS')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { email: true, name: true, emailVerified: true },
  });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  if (user.emailVerified) {
    // They already set a password from an email; "Forgot password?" covers them now.
    return NextResponse.json({ error: 'This user has already confirmed their email' }, { status: 409 });
  }

  const emailSent = await sendAccountSetupEmail(user.email, user.name);
  return NextResponse.json({ emailSent });
}
