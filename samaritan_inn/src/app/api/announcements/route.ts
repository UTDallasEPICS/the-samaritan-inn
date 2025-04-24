import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Fetch all announcements
export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

// Create a new announcement
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content, author, isAdmin } = body;

    // Check if the user is an admin
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Create a new announcement
    const announcement = await prisma.announcement.create({
      data: { title, content, author },
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}