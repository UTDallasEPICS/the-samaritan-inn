import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/events
export async function GET() {
  try {
    const events = await prisma.event.findMany({ orderBy: { startDate: 'asc' } });
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST /api/events
export async function POST(req: Request) {
  try {
    const { title, content, startDate, endDate, startTime, endTime } = await req.json();
    if (!title?.trim() || !content?.trim() || !startDate || !endDate || !startTime || !endTime) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    const newEvent = await prisma.event.create({
      data: {
        title,
        content,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        startTime: new Date(`${startDate}T${startTime}`),
        endTime: new Date(`${endDate}T${endTime}`),
      },
    });
    return NextResponse.json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
