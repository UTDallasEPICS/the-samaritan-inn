import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/events/:id
export async function PUT(
  req: Request,
  { params }: { params: any }
) {
  const { id } = params
  try {
    const { title, content, startDate, endDate, startTime, endTime } =
      await req.json()

    // validate…
    if (
      !title?.trim() ||
      !content?.trim() ||
      !startDate ||
      !endDate ||
      !startTime ||
      !endTime
    ) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Option A: client already sends full ISO strings for startTime/endTime,
    // so just parse them directly:
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title,
        content,
        startDate: new Date(startDate),
        endDate:   new Date(endDate),
        startTime: new Date(startTime),
        endTime:   new Date(endTime),
      },
    })

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

// DELETE /api/events/:id
export async function DELETE(
  _req: Request,
  { params }: { params: any }
) {
  const { id } = params
  try {
    await prisma.event.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}
