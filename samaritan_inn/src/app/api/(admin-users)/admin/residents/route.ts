import { randomInt } from 'crypto';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getServerSessionInfo } from '@/lib/getServerSessionInfo';
import { can } from '@/lib/permissions';
import { validateResident } from '@/lib/residentValidation';
import { sendAccountSetupEmail } from '@/lib/passwordReset';
import type { NextRequest } from 'next/server';

// Skips look-alike characters (0/O, 1/l/I) so the password is easy to read out loud.
const PASSWORD_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';

function generateTempPassword(length = 12): string {
  return Array.from({ length }, () => PASSWORD_CHARS[randomInt(PASSWORD_CHARS.length)]).join('');
}

export async function POST(request: NextRequest) {
  const session = await getServerSessionInfo(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!can(session.role, 'MANAGE_USERS')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: { name?: unknown; email?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  const errors = validateResident({ name, email });
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: 'Invalid input', fields: errors }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
  }

  // The plaintext password is only returned in this response; only the hash is stored.
  const tempPassword = generateTempPassword();
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: await bcrypt.hash(tempPassword, 10),
      role: 'resident',
    },
    select: { id: true, name: true, email: true },
  });

  // Email the resident a link to choose their own password. The account is already
  // created, so a mail failure is reported to the admin instead of failing the request.
  const emailSent = await sendAccountSetupEmail(user.email, user.name);

  return NextResponse.json({ user, tempPassword, emailSent }, { status: 201 });
}
