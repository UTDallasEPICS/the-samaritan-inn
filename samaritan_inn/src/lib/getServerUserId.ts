import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

/**
 * Returns the userId (JWT sub) from the NextAuth session cookie.
 */
export async function getServerUserId(request: NextRequest): Promise<string | null> {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    return (token?.sub as string) ?? null;
  } catch {
    return null;
  }
}
