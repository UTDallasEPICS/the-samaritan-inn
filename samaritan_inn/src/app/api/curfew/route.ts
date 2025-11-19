import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { id, accepted, reason } = await req.json();

    const updated = await prisma.curfewRequest.update({
      where: { id },
      data: {
        status: accepted ? 'approved' : 'denied',
        reason: accepted ? null : reason || null
      },
    });

    return NextResponse.json({ success: true, updated });
  } catch (err) {
    console.error("Curfew decision error:", err);
    return NextResponse.json(
      { success: false, error: "Could not update request." },
      { status: 500 }
    );
  }
}
