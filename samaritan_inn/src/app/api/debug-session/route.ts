import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  return NextResponse.json({
    hasSecret: !!process.env.NEXTAUTH_SECRET,
    token: token ?? null,
  });
}
