import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUserId } from "@/lib/getServerUserId";
import { syncScheduledEvent } from "@/lib/scheduled-events";
import { findCaseworker, getCaseworkerProfiles } from "@/lib/caseworkers";

export async function GET(request: NextRequest) {
  const userId = await getServerUserId(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appointments = await prisma.appointment.findMany({
    where: { userId },
    orderBy: { startTime: "asc" },
  });

  // Look up every caseworker in one Salesforce call. If Salesforce is down the
  // appointments are still listed (they live in our database), just without
  // the caseworker's name.
  const ownerIds = [
    ...new Set(appointments.map((a) => a.ownerId).filter((id): id is string => Boolean(id))),
  ];
  const profiles = await getCaseworkerProfiles({ ids: ownerIds }).catch((error) => {
    console.error("my-events caseworker lookup failed:", error);
    return [];
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
          caseWorkerName: findCaseworker(profiles, a.ownerId)?.name ?? null,
          salesforceId: a.salesforceEventId,
          userId: a.userId,
        })
      )
  );

  const events = appointments.map((a) => {
    const caseworker = findCaseworker(profiles, a.ownerId);
    return {
      id: a.id,
      title: a.title,
      description: a.description,
      startTime: a.startTime,
      endTime: a.endTime,
      ownerId: a.ownerId,
      caseWorker: caseworker?.name ?? null,
      caseWorkerTitle: caseworker?.title ?? null,
      salesforceId: a.salesforceEventId,
      createdAt: a.createdAt,
    };
  });

  return NextResponse.json(events);
}
