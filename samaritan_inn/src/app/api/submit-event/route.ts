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



export async function POST(request: Request) {
  const body = await request.json();
  const { title, startDate, endDate, description, location } = body;

  const token = await getSalesforceToken();
  console.log('Token received:', token);

  const res = await fetch(
    `${process.env.SF_INSTANCE_URL}/services/data/v59.0/sobjects/Event`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Subject: title,
        StartDateTime: startDate,
        EndDateTime: endDate,
        Description: description,
        Location: location,
        OwnerId: "005gK00002Vwt4T",
        WhatId: "001gK00000hBCOaQAO",
      }),
    }
  );

  const data = await res.json();
  console.log('Salesforce response:', data);
  return NextResponse.json({ success: true, id: data.id });
}