-- CreateTable
CREATE TABLE "ExtendedCurfewRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "todayDate" DATETIME NOT NULL,
    "residentName" TEXT NOT NULL,
    "datesNeeded" TEXT NOT NULL,
    "expectedReturnTime" TEXT NOT NULL,
    "isOngoing" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT NOT NULL,
    "choreCoveredBy" TEXT,
    "choreCoverageSignature" TEXT,
    "residentSignature" TEXT NOT NULL,
    "adminName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminSignature" TEXT,
    "decisionDate" DATETIME,
    "commentsNotes" TEXT,
    "receivedDate" DATETIME,
    "adminInitials" TEXT,
    "userId" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ExtendedCurfewRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PassRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "residentName" TEXT NOT NULL,
    "todayDate" DATETIME NOT NULL,
    "datesRequested" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "choreCoveredBy" TEXT,
    "choreCoverageSignature" TEXT,
    "residentSignature" TEXT NOT NULL,
    "signatureDate" DATETIME NOT NULL,
    "adminName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminSignature" TEXT,
    "decisionDate" DATETIME,
    "userId" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PassRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "residentName" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "employmentStatus" TEXT NOT NULL,
    "employerName" TEXT,
    "employerLocation" TEXT,
    "weekOf" DATETIME NOT NULL,
    "monthOf" TEXT NOT NULL,
    "transportation" TEXT NOT NULL,
    "estimatedTravelTime" TEXT NOT NULL,
    "residentSignature" TEXT NOT NULL,
    "signatureDate" DATETIME NOT NULL,
    "enteredByInitials" TEXT,
    "userId" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkScheduleDay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scheduleId" TEXT NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "date" DATETIME,
    "startTime" TEXT,
    "endTime" TEXT,
    CONSTRAINT "WorkScheduleDay_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "WorkSchedule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkScheduleDay_scheduleId_dayOfWeek_key" ON "WorkScheduleDay"("scheduleId", "dayOfWeek");
