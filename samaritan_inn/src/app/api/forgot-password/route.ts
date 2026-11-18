import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isResetThrottled, sendPasswordResetEmail } from '@/lib/passwordReset';

// Always answers 200 with the same body, whether or not the email has an account, so
// this endpoint can't be used to discover which emails are registered.
export async function POST(request: Request) {
  let email = '';
  try {
    const body = await request.json();
    email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  // The email is sent without awaiting it: waiting on SMTP only when the account exists
  // would make the response slower for registered emails and leak which ones exist.
  if (!isResetThrottled(email)) {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (user) {
      sendPasswordResetEmail(email).catch((error) =>
        console.error('[password/forgot] failed to send reset email:', error)
      );
    }
  }

  return NextResponse.json({ ok: true });
}
