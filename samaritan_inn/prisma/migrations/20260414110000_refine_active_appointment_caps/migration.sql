ALTER TABLE "Appointment" ADD COLUMN "activeBookingDateKey" TEXT;

UPDATE "Appointment"
SET "activeBookingDateKey" = "bookingDate"
WHERE "activeBookingOrdinal" IS NOT NULL;

DROP INDEX "Appointment_userId_bookingDate_activeBookingOrdinal_key";

CREATE UNIQUE INDEX "Appointment_userId_activeBookingOrdinal_key"
  ON "Appointment"("userId", "activeBookingOrdinal");
