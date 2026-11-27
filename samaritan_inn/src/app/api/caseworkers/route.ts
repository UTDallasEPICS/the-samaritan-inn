import { NextRequest, NextResponse } from "next/server";
import { getServerUserId } from "@/lib/getServerUserId";
import { getBookingHoursLabel } from "@/lib/booking";
import { SalesforceError } from "@/lib/salesforce";
import {
  getCaseworkerProfiles,
  getConfiguredCaseworkerOwnerIds,
} from "@/lib/caseworkers";
import {
  getCaseworkerSource,
  getLocalCaseworkerData,
} from "@/lib/caseworker-directory";

/**
 * Every Empowerment Coach, for the /empowerment-coaches page. Any logged-in
 * user may read it; residents pick their coach from this list.
 * - coaches: everyone residents can find (and book, when they have a link)
 * - bookingHours: the hours appointments can be booked in (Salesforce only)
 */
export async function GET(request: NextRequest) {
  const userId = await getServerUserId(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // CASEWORKER_SOURCE="local": coaches come from the in-app directory and
  // residents book through each coach's Outlook / Microsoft Bookings link.
  if (getCaseworkerSource() === "local") {
    try {
      return NextResponse.json(await getLocalCaseworkerData());
    } catch (error) {
      console.error("caseworkers (local) error:", error);
      return NextResponse.json(
        { error: "Unable to load Empowerment Coaches." },
        { status: 500 }
      );
    }
  }

  try {
    const coaches = await getCaseworkerProfiles({
      ids: getConfiguredCaseworkerOwnerIds(),
    });

    return NextResponse.json({
      coaches,
      bookingHours: getBookingHoursLabel(),
    });
  } catch (error) {
    if (error instanceof SalesforceError) {
      console.error("caseworkers Salesforce error:", error);
      return NextResponse.json(
        { error: "Empowerment Coach information is unavailable right now." },
        { status: 502 }
      );
    }

    console.error("caseworkers error:", error);
    return NextResponse.json(
      { error: "Unable to load Empowerment Coaches." },
      { status: 500 }
    );
  }
}
