import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUserId } from "@/lib/getServerUserId";
import { getBookingHoursLabel } from "@/lib/booking";
import { SalesforceError } from "@/lib/salesforce";
import {
  getCaseworkerProfiles,
  getConfiguredCaseworkerOwnerIds,
  isSameCaseworkerId,
} from "@/lib/caseworkers";

/**
 * Caseworker data for the logged-in resident's Appointments page:
 * - myCaseworkers: the caseworker(s) assigned to this resident
 * - bookableCaseworkers: everyone the resident may book with
 * - bookingHours: the hours appointments can be booked in
 */
export async function GET(request: NextRequest) {
  const userId = await getServerUserId(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const assignments = await prisma.caseworkerAssignment.findMany({
      where: { residentId: userId },
      select: { caseworkerEmail: true },
    });
    const assignedEmails = assignments.map((a) => a.caseworkerEmail);
    const bookableIds = getConfiguredCaseworkerOwnerIds();

    // One Salesforce round trip covers both lists.
    const profiles = await getCaseworkerProfiles({
      ids: bookableIds,
      emails: assignedEmails,
    });

    const assigned = new Set(assignedEmails.map((e) => e.toLowerCase()));
    const myCaseworkers = profiles.filter(
      (p) => p.email && assigned.has(p.email.toLowerCase())
    );
    const bookableCaseworkers = profiles.filter((p) =>
      bookableIds.some((id) => isSameCaseworkerId(id, p.id))
    );

    return NextResponse.json({
      myCaseworkers,
      bookableCaseworkers,
      bookingHours: getBookingHoursLabel(),
    });
  } catch (error) {
    if (error instanceof SalesforceError) {
      console.error("caseworkers Salesforce error:", error);
      return NextResponse.json(
        { error: "Caseworker information is unavailable right now." },
        { status: 502 }
      );
    }

    console.error("caseworkers error:", error);
    return NextResponse.json(
      { error: "Unable to load caseworker information." },
      { status: 500 }
    );
  }
}
