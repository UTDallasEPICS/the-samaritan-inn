import { NextResponse } from 'next/server';

// ALB health check target on NPTS infra; must return 200 without auth.
export function GET() {
  return NextResponse.json({ status: 'ok' });
}
