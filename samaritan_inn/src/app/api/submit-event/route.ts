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

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, startDate, endDate, description, location, ownerId, caseWorkerLabel } = body;

  const sfToken = await getSalesforceToken();

  const res = await fetch(
    `${process.env.SF_INSTANCE_URL}/services/data/v59.0/sobjects/Event`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Subject: title,
        StartDateTime: startDate,
        EndDateTime: endDate,
        Description: description,
        Location: location,
        OwnerId: ownerId ?? '005gK00002Vwt4T',
      }),
    }
  );

  const data = await res.json();
  console.log('Salesforce response:', data);

  try {
    const userId = await getServerUserId(request);
    console.log('userId resolved:', userId);
    if (userId) {
      await prisma.scheduledEvent.create({
        data: {
          title,
          startTime: new Date(startDate),
          endTime: new Date(endDate),
          caseWorker: caseWorkerLabel ?? 'Unknown',
          salesforceId: data.id ?? null,
          userId,
        },
      });
    } else {
      console.warn('No userId found — event not saved locally');
    }
  } catch (err) {
    console.error('Local DB save failed:', err);
  }

  return NextResponse.json({ success: true, id: data.id });
}
