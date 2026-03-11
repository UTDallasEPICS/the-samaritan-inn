import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('API /api/pass/pass-request received body:', body);
    const {
  
      userId,
      residentName,
      todayDate,
      datesRequested,
      reason,
      choreCoveredBy,
      choreCoverageSignature,
      signatureDate,
      residentSignature,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 400 });
    }

    const request = await prisma.passRequest.create({
      data: {
        userId,
        residentName,
        todayDate: new Date(todayDate),
        datesRequested,
        reason,
        choreCoveredBy: choreCoveredBy || null,
        choreCoverageSignature: choreCoverageSignature || null,
        signatureDate: new Date(signatureDate),
        residentSignature,
      },
    });

    return NextResponse.json(request);
  } catch (error) {
    console.error('Error creating pass request:', error);
    return NextResponse.json({ error: 'Failed to submit request', detail: String(error) }, { status: 500 });
  }
}
