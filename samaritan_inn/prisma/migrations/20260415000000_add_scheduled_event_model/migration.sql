CREATE TABLE "ScheduledEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appointmentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "caseWorker" TEXT NOT NULL,
    "salesforceId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "ScheduledEvent_appointmentId_key" ON "ScheduledEvent"("appointmentId");
CREATE UNIQUE INDEX "ScheduledEvent_salesforceId_key" ON "ScheduledEvent"("salesforceId");
CREATE INDEX "ScheduledEvent_userId_startTime_idx" ON "ScheduledEvent"("userId", "startTime");
