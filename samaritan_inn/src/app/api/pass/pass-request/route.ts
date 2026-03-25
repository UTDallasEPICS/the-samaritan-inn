import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// TODO: Implement POST handler for PassRequest
export async function POST() {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}

export async function GET() {
  try {
    const requests = await prisma.passRequest.findMany({
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching pass requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pass requests' },
      { status: 500 }
    );
  }
}