ALTER TABLE "Appointment" ADD COLUMN "salesforceEventId" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "ownerId" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "bookingDate" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "activeBookingOrdinal" INTEGER;
ALTER TABLE "Appointment" ADD COLUMN "canceledAt" DATETIME;

CREATE UNIQUE INDEX "Appointment_salesforceEventId_key" ON "Appointment"("salesforceEventId");
CREATE INDEX "Appointment_userId_bookingDate_idx" ON "Appointment"("userId", "bookingDate");
CREATE UNIQUE INDEX "Appointment_userId_bookingDate_activeBookingOrdinal_key"
  ON "Appointment"("userId", "bookingDate", "activeBookingOrdinal");
