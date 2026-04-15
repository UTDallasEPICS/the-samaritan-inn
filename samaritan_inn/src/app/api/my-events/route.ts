import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUserId } from "@/lib/getServerUserId";
import { getCaseWorkerLabel, syncScheduledEvent } from "@/lib/scheduled-events";

export async function GET(request: NextRequest) {
  const userId = await getServerUserId(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appointments = await prisma.appointment.findMany({
    where: { userId },
    orderBy: { startTime: "asc" },
  });

  await Promise.all(
    appointments
      .filter((a) => a.salesforceEventId)
      .map((a) =>
        syncScheduledEvent({
          appointmentId: a.id,
          title: a.title,
          startTime: a.startTime,
          endTime: a.endTime,
          ownerId: a.ownerId,
          salesforceId: a.salesforceEventId,
          userId: a.userId,
        })
      )
  );

  const events = appointments.map((a) => ({
    id: a.id,
    title: a.title,
    startTime: a.startTime,
    endTime: a.endTime,
    caseWorker: getCaseWorkerLabel(a.ownerId),
    salesforceId: a.salesforceEventId,
    createdAt: a.createdAt,
  }));

  return NextResponse.json(events);
}
