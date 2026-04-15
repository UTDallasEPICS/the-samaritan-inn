import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  ApiError,
  finalizeAppointmentReservation,
  isIntervalAvailable,
  releaseAppointmentReservation,
  reserveAppointment,
  validateBookingRequest,
} from "@/lib/booking";
import {
  createSalesforceEvent,
  deleteSalesforceEvent,
  fetchSalesforceEventsForOwnerOnDate,
  resolveSalesforceOwnerId,
  SalesforceError,
} from "@/lib/salesforce";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return errorResponse("You must be signed in to book an appointment.", 401);
    }

    const body = await request.json();
    const title = body.title?.trim();
    const description = body.description?.trim() || undefined;
    const location = body.location?.trim() || undefined;
    const ownerId = resolveSalesforceOwnerId(body.ownerId);

    if (!title || !body.startDate || !body.endDate) {
      throw new ApiError(400, "title, startDate, and endDate are required.");
    }

    if (!ownerId) {
      throw new ApiError(400, "A valid calendar ownerId is required.");
    }

    const interval = {
      start: new Date(body.startDate),
      end: new Date(body.endDate),
    };
    const { bookingDate } = validateBookingRequest(interval);

    const bookedEvents = await fetchSalesforceEventsForOwnerOnDate(
      bookingDate,
      ownerId
    );
    const bookedIntervals = bookedEvents.map((event) => ({
      start: new Date(event.StartDateTime),
      end: new Date(event.EndDateTime),
    }));

    if (!isIntervalAvailable(interval, bookedIntervals)) {
      throw new ApiError(
        409,
        "That appointment time is no longer available. Please choose another slot."
      );
    }

    const reservation = await reserveAppointment({
      title,
      description,
      location,
      ownerId,
      userId: user.id,
      startTime: interval.start,
      endTime: interval.end,
      bookingDate,
    });

    let salesforceEventId: string | null = null;

    try {
      salesforceEventId = await createSalesforceEvent({
        title,
        description,
        location,
        ownerId,
        startDate: interval.start.toISOString(),
        endDate: interval.end.toISOString(),
        whatId: "001gK00000hBCOaQAO",
      });

      await finalizeAppointmentReservation(reservation.id, salesforceEventId);
    } catch (error) {
      const cleanupTasks = [releaseAppointmentReservation(reservation.id)];

      if (salesforceEventId) {
        cleanupTasks.push(deleteSalesforceEvent(salesforceEventId));
      }

      await Promise.allSettled(cleanupTasks);
      throw error;
    }

    return NextResponse.json({ success: true, id: salesforceEventId }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return errorResponse(error.message, error.status);
    }

    if (error instanceof SalesforceError) {
      console.error("Salesforce booking error:", error);
      return errorResponse(
        "The scheduling service is unavailable right now. Please try again.",
        502
      );
    }

    if (error instanceof SyntaxError) {
      return errorResponse("The request body must be valid JSON.", 400);
    }

    console.error("submit-event error:", error);
    return errorResponse("Unable to create the appointment.", 500);
  }
}
