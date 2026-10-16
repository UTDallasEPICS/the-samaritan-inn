import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';

/**
 * Reads the JWT from the request, then looks up the real DB user by email.
 * Using email (not token.sub) avoids stale-id FK violations.
 */
export async function getServerUserId(request: NextRequest): Promise<string | null> {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const email = token?.email as string | undefined;
    if (!email) return null;
    const user = await prisma.user.findUnique({ where: { email } });
    return user?.id ?? null;
  } catch {
    return null;
  }
}
