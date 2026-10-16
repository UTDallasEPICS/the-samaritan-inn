import { prisma } from "@/lib/prisma";

function getConfiguredCaseWorkers() {
  return [
    {
      ownerId: process.env.NEXT_PUBLIC_SF_OWNER_1,
      label: "Case Worker 1",
    },
    {
      ownerId: process.env.NEXT_PUBLIC_SF_OWNER_2,
      label: "Case Worker 2",
    },
    {
      ownerId: process.env.NEXT_PUBLIC_SF_OWNER_3,
      label: "Case Worker 3",
    },
  ].filter((worker): worker is { ownerId: string; label: string } => Boolean(worker.ownerId));
}

export function getCaseWorkerLabel(ownerId?: string | null) {
  if (!ownerId) {
    return "Case Worker";
  }

  return (
    getConfiguredCaseWorkers().find((worker) => worker.ownerId === ownerId)?.label ??
    ownerId
  );
}

type SyncScheduledEventInput = {
  appointmentId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  ownerId?: string | null;
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
        caseWorker: getCaseWorkerLabel(input.ownerId),
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
      caseWorker: getCaseWorkerLabel(input.ownerId),
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
