import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';

export type ServerSessionInfo = { id: string; role: string };

export async function getServerSessionInfo(
  request: NextRequest
): Promise<ServerSessionInfo | null> {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const email = token?.email as string | undefined;
    if (!email) return null;
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true },
    });
    return user ? { id: user.id, role: user.role } : null;
  } catch {
    return null;
  }
}
