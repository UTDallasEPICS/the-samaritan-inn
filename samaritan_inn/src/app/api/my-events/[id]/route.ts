import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUserId } from "@/lib/getServerUserId";
import { deleteSalesforceEvent, SalesforceError } from "@/lib/salesforce";
import { deleteScheduledEventMirror } from "@/lib/scheduled-events";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getServerUserId(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const appointment = await prisma.appointment.findUnique({ where: { id } });

  if (!appointment || appointment.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (appointment.salesforceEventId) {
    try {
      await deleteSalesforceEvent(appointment.salesforceEventId);
    } catch (error) {
      if (error instanceof SalesforceError) {
        console.error("Salesforce delete failed:", error);
      } else {
        console.error("Unexpected Salesforce delete error:", error);
      }
    }
  }

  await deleteScheduledEventMirror({
    appointmentId: appointment.id,
    salesforceId: appointment.salesforceEventId,
  });

  await prisma.appointment.delete({ where: { id: appointment.id } });

  return NextResponse.json({ success: true });
}
