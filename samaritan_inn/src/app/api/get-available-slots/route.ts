import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  ApiError,
  buildAvailableSlots,
  getActiveAppointmentSummary,
  isDateWithinBookingWindow,
  SameDayActiveAppointmentError,
  TotalActiveAppointmentLimitError,
} from "@/lib/booking";
import {
  fetchSalesforceEventsForOwnerOnDate,
  resolveSalesforceOwnerId,
  SalesforceError,
} from "@/lib/salesforce";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const ownerId = resolveSalesforceOwnerId(searchParams.get("ownerId"));

    if (!date) {
      throw new ApiError(400, "The date query parameter is required.");
    }

    if (!ownerId) {
      throw new ApiError(400, "A valid calendar ownerId is required.");
    }

    if (!isDateWithinBookingWindow(date)) {
      throw new ApiError(400, "Your booking is more than one month out.");
    }

    if (user?.id) {
      const appointmentSummary = await getActiveAppointmentSummary(user.id, date);

      if (appointmentSummary.totalActiveAppointments >= 7) {
        throw new TotalActiveAppointmentLimitError();
      }

      if (appointmentSummary.hasActiveAppointmentOnDate) {
        throw new SameDayActiveAppointmentError();
      }
    }

    const bookedEvents = await fetchSalesforceEventsForOwnerOnDate(date, ownerId);
    const bookedIntervals = bookedEvents.map((event) => ({
      start: new Date(event.StartDateTime),
      end: new Date(event.EndDateTime),
    }));

    return NextResponse.json(buildAvailableSlots(date, bookedIntervals));
  } catch (error) {
    if (error instanceof ApiError) {
      return errorResponse(error.message, error.status);
    }

    if (error instanceof SalesforceError) {
      console.error("get-available-slots Salesforce error:", error);
      return errorResponse(
        "The scheduling service is unavailable right now. Please try again.",
        502
      );
    }

    console.error("get-available-slots error:", error);
    return errorResponse("Unable to load available slots.", 500);
  }
}
