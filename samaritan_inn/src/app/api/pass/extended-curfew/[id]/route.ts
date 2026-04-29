import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const record = await prisma.extendedCurfewRequest.findUnique({ where: { id } });
    if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch', detail: String(error) }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { status, commentsNotes, adminName } = await req.json();
    if (!['APPROVED', 'DENIED', 'PENDING'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    const updated = await prisma.extendedCurfewRequest.update({
      where: { id },
      data: {
        status,
        adminName: adminName ?? null,
        decisionDate: new Date(),
        commentsNotes: commentsNotes ?? null,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update', detail: String(error) }, { status: 500 });
  }
}
