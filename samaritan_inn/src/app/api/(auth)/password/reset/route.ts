import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { consumeResetToken } from '@/lib/passwordReset';

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_BYTES = 72;

export async function POST(request: Request) {
  let body: { email?: unknown; token?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const token = typeof body.token === 'string' ? body.token : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !token) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 400 });
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
      { status: 400 }
    );
  }
  // bcrypt ignores everything past 72 bytes, so reject rather than silently truncate.
  if (Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES) {
    return NextResponse.json({ error: 'Password is too long' }, { status: 400 });
  }
  if (!(await consumeResetToken(email, token))) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 400 });
  }

  // updateMany rather than update so an account deleted since the link was sent gives a
  // clean error instead of a 500.
  const { count } = await prisma.user.updateMany({
    where: { email },
    data: { password: await bcrypt.hash(password, 10) },
  });
  if (count === 0) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 400 });
  }
  // Redeeming an emailed link proves the user controls this inbox. Record the first
  // time that happens so admins can see who has confirmed their email.
  await prisma.user.updateMany({
    where: { email, emailVerified: null },
    data: { emailVerified: new Date() },
  });
  return NextResponse.json({ ok: true });
}
