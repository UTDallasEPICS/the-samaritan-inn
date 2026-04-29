import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      message:
        'Public self-registration is disabled. An admin must create user accounts from inside the app.',
    },
    { status: 403 }
  );
}
