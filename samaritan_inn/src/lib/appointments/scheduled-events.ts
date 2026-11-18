import { prisma } from "@/lib/prisma";

type SyncScheduledEventInput = {
  appointmentId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  ownerId?: string | null;
  /** The caseworker's real name from Salesforce, when it could be looked up. */
  caseWorkerName?: string | null;
  salesforceId?: string | null;
  userId: string;
};

export async function syncScheduledEvent(input: SyncScheduledEventInput) {
  const existing = await prisma.scheduledEvent.findUnique({
    where: { appointmentId: input.appointmentId },
    select: { id: true },
  });

  if (existing) {
    return prisma.scheduledEvent.update({
      where: { id: existing.id },
      data: {
        title: input.title,
        startTime: input.startTime,
        endTime: input.endTime,
        // Keep the stored name if Salesforce couldn't be reached this time.
        ...(input.caseWorkerName ? { caseWorker: input.caseWorkerName } : {}),
        salesforceId: input.salesforceId ?? null,
        userId: input.userId,
      },
    });
  }

  return prisma.scheduledEvent.create({
    data: {
      appointmentId: input.appointmentId,
      title: input.title,
      startTime: input.startTime,
      endTime: input.endTime,
      // Fall back to the Salesforce owner id so the record still identifies
      // who the appointment is with.
      caseWorker: input.caseWorkerName || input.ownerId || "",
      salesforceId: input.salesforceId ?? null,
      userId: input.userId,
    },
  });
}

export async function deleteScheduledEventMirror(options: {
  appointmentId?: string;
  salesforceId?: string | null;
}) {
  if (options.appointmentId) {
    await prisma.scheduledEvent.deleteMany({
      where: { appointmentId: options.appointmentId },
    });
    return;
  }

  if (options.salesforceId) {
    await prisma.scheduledEvent.deleteMany({
      where: { salesforceId: options.salesforceId },
    });
  }
}
