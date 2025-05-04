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

    // parse times — handle both “HH:mm” and full ISO strings
    const parsedStartTime = startTime.includes('T')
      ? new Date(startTime)
      : new Date(`${startDate}T${startTime}`)
    const parsedEndTime = endTime.includes('T')
      ? new Date(endTime)
      : new Date(`${endDate}T${endTime}`)

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title,
        content,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        startTime: parsedStartTime,
        endTime: parsedEndTime,
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
  const { id } = await params
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