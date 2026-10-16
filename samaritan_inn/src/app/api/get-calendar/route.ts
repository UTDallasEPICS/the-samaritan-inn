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
  console.log('Full token response:', data);
  return data.access_token;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const token = await getSalesforceToken();
  console.log('Token received:', token);

  const query = `SELECT Id, Subject, StartDateTime, EndDateTime, Description, Location FROM Event WHERE StartDateTime >= ${startDate}T00:00:00Z AND StartDateTime <= ${endDate}T23:59:59Z`;

  const res = await fetch(
    `${process.env.SF_INSTANCE_URL}/services/data/v59.0/query?q=${encodeURIComponent(query)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const data = await res.json();
  console.log('Salesforce response:', data);

  const events = data.records.map((e: any) => ({
    id: e.Id,
    title: e.Subject,
    start: e.StartDateTime,
    end: e.EndDateTime,
    description: e.Description,
    location: e.Location,
  }));

  return NextResponse.json(events);
}
