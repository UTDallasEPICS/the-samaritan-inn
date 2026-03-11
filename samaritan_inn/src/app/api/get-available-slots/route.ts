// src/app/api/get-available-slots/route.ts

import { NextResponse } from 'next/server';

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  const token = await getSalesforceToken();

  // Pull ALL events that overlap with this day in any way
  const query = `SELECT StartDateTime, EndDateTime FROM Event 
    WHERE StartDateTime <= ${date}T23:59:59Z 
    AND EndDateTime >= ${date}T00:00:00Z
    AND OwnerId = '${process.env.SF_OWNER_ID}'`;

  const res = await fetch(
    `${process.env.SF_INSTANCE_URL}/services/data/v59.0/query?q=${encodeURIComponent(query)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const data = await res.json();
  const bookedEvents = data.records;

  console.log('Date requested:', date);
  console.log('Booked events from Salesforce:', JSON.stringify(bookedEvents, null, 2));
  console.log('Number of booked events:', bookedEvents.length);

  // Dynamically calculate 9am-5pm Central time in UTC
  // This automatically handles daylight saving time changes
  const get9amCentral = (dateStr: string) => {
    const d = new Date(`${dateStr}T09:00:00`);
    const centralStr = d.toLocaleString('en-US', { timeZone: 'America/Chicago' });
    const centralDate = new Date(centralStr);
    const offset = d.getTime() - centralDate.getTime();
    return new Date(d.getTime() + offset);
  };

  const get5pmCentral = (dateStr: string) => {
    const d = new Date(`${dateStr}T17:00:00`);
    const centralStr = d.toLocaleString('en-US', { timeZone: 'America/Chicago' });
    const centralDate = new Date(centralStr);
    const offset = d.getTime() - centralDate.getTime();
    return new Date(d.getTime() + offset);
  };

  const slots = [];
  const start = get9amCentral(date!);
  const end = get5pmCentral(date!);

  while (start < end) {
    const slotEnd = new Date(start.getTime() + 15 * 60 * 1000);

    // Check if this slot overlaps with any booked event
    const isBooked = bookedEvents.some((event: any) => {
      const eventStart = new Date(event.StartDateTime);
      const eventEnd = new Date(event.EndDateTime);
      return start < eventEnd && slotEnd > eventStart;
    });

    if (!isBooked) {
      slots.push({
        start: start.toISOString(),
        end: slotEnd.toISOString(),
        label: start.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Chicago'
        })
      });
    }

    start.setMinutes(start.getMinutes() + 15);
  }

  return NextResponse.json(slots);
}