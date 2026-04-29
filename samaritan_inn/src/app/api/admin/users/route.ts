import { prisma } from '@/lib/prisma';
import { getServerSessionInfo } from '@/lib/getServerSessionInfo';
import {
  createManagedUser,
  getUserCreationAccess,
  UserCreationError,
} from '@/lib/user-management';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const session = await getServerSessionInfo(request);
  const access = getUserCreationAccess(session);

  if (!access.ok) {
    return NextResponse.json({ message: access.message }, { status: access.status });
  }

  try {
    const body = await request.json();
    const user = await createManagedUser({
      prisma,
      input: body,
    });

    return NextResponse.json(
      {
        message: 'User created successfully',
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof UserCreationError) {
      return NextResponse.json(
        { message: error.message, issues: error.issues },
        { status: error.status }
      );
    }

    console.error('Admin user creation error:', error);
    return NextResponse.json(
      { message: 'Something went wrong while creating the user' },
      { status: 500 }
    );
  }
}
