import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSessionInfo } from '@/lib/getServerSessionInfo';
import { can } from '@/lib/permissions';
import { createSalesforceWorkSchedule, isValidSalesforceId } from '@/lib/salesforce';
import type { NextRequest } from 'next/server';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const record = await prisma.workSchedule.findUnique({
      where: { id },
      include: { days: true },
    });
    if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch', detail: String(error) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getServerSessionInfo(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!can(session.role, 'REVIEW_REQUESTS')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { status, commentsNotes, adminName } = await req.json();
    if (!['APPROVED', 'DENIED', 'PENDING'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const existing = await prisma.workSchedule.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const shouldSyncToSalesforce = status === 'APPROVED';

    const updated = await prisma.workSchedule.update({
      where: { id },
      data: {
        status,
        adminName: adminName ?? null,
        decisionDate: new Date(),
        commentsNotes: commentsNotes ?? null,
      },
    });

    if (shouldSyncToSalesforce) {
      const contactId = process.env.SF_TEST_CONTACT_ID;
      if (!contactId || !isValidSalesforceId(contactId)) {
        return NextResponse.json(
          { error: 'Approval was saved, but Salesforce Contact configuration is missing or invalid.' },
          { status: 500 }
        );
      }

      try {
        const savedSchedule = await prisma.workSchedule.findUnique({
          where: { id },
          include: { days: true },
        });
        if (!savedSchedule) {
          throw new Error('Approved work schedule could not be reloaded from Prisma.');
        }
        await createSalesforceWorkSchedule(savedSchedule, contactId);
      } catch (error) {
        console.error('Approved work schedule Salesforce sync failed:', error);
        return NextResponse.json(
          {
            error: 'Approval was saved, but Salesforce work schedule creation failed.',
            detail: error instanceof Error ? error.message : 'Unknown Salesforce error.',
          },
          { status: 502 }
        );
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update', detail: String(error) }, { status: 500 });
  }
}
