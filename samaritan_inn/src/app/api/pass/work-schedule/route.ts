import { NextResponse } from 'next/server';

// TODO: Implement POST handler for WorkSchedule
export async function POST() {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}

export async function GET() {
  try {
    const requests = await prisma.extendedCurfewRequest.findMany({
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching extended curfew requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}