import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCaseWorkerLabel, syncScheduledEvent } from "@/lib/scheduled-events";

export async function GET() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appointments = await prisma.appointment.findMany({
    where: { userId: user.id },
    orderBy: { startTime: "asc" },
  });

  await Promise.all(
    appointments
      .filter((appointment) => appointment.salesforceEventId)
      .map((appointment) =>
        syncScheduledEvent({
          appointmentId: appointment.id,
          title: appointment.title,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          ownerId: appointment.ownerId,
          salesforceId: appointment.salesforceEventId,
          userId: appointment.userId,
        })
      )
  );

  const events = appointments.map((appointment) => ({
    id: appointment.id,
    title: appointment.title,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    caseWorker: getCaseWorkerLabel(appointment.ownerId),
    salesforceId: appointment.salesforceEventId,
    createdAt: appointment.createdAt,
  }));

  return NextResponse.json(events);
}
