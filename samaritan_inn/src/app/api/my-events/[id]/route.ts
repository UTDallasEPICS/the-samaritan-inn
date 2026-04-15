import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerUserId } from '@/lib/getServerUserId';

async function getSalesforceToken() {
  const res = await fetch(`${process.env.SF_LOGIN_URL}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.SF_CLIENT_ID!,
      client_secret: process.env.SF_CLIENT_SECRET!,
    }),
  });
  const data = await res.json();
  return data.access_token;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getServerUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const event = await prisma.scheduledEvent.findUnique({ where: { id } });
  if (!event || event.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Delete from Salesforce if we have the SF event ID
  if (event.salesforceId) {
    try {
      const sfToken = await getSalesforceToken();
      await fetch(
        `${process.env.SF_INSTANCE_URL}/services/data/v59.0/sobjects/Event/${event.salesforceId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${sfToken}` },
        }
      );
    } catch (err) {
      console.error('Salesforce delete failed:', err);
      // Still delete locally even if SF fails
    }
  }

  await prisma.scheduledEvent.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
