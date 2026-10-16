/*
  Warnings:

  - You are about to drop the column `choreCoveredBy` on the `ExtendedCurfewRequest` table. All the data in the column will be lost.
  - You are about to drop the column `choreCoveredBy` on the `PassRequest` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ExtendedCurfewRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "todayDate" DATETIME NOT NULL,
    "residentName" TEXT NOT NULL,
    "datesNeeded" TEXT NOT NULL,
    "expectedReturnTime" TEXT NOT NULL,
    "isOngoing" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT NOT NULL,
    "choreCoveredById" TEXT,
    "choreCoverageSignature" TEXT,
    "residentSignature" TEXT NOT NULL,
    "adminName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminSignature" TEXT,
    "decisionDate" DATETIME,
    "commentsNotes" TEXT,
    "receivedDate" DATETIME,
    "adminInitials" TEXT,
    "assignedCaseworkerId" TEXT,
    "userId" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ExtendedCurfewRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ExtendedCurfewRequest" ("adminInitials", "adminName", "adminSignature", "assignedCaseworkerId", "choreCoverageSignature", "commentsNotes", "datesNeeded", "decisionDate", "expectedReturnTime", "id", "isOngoing", "reason", "receivedDate", "residentName", "residentSignature", "status", "submittedAt", "todayDate", "updatedAt", "userId") SELECT "adminInitials", "adminName", "adminSignature", "assignedCaseworkerId", "choreCoverageSignature", "commentsNotes", "datesNeeded", "decisionDate", "expectedReturnTime", "id", "isOngoing", "reason", "receivedDate", "residentName", "residentSignature", "status", "submittedAt", "todayDate", "updatedAt", "userId" FROM "ExtendedCurfewRequest";
DROP TABLE "ExtendedCurfewRequest";
ALTER TABLE "new_ExtendedCurfewRequest" RENAME TO "ExtendedCurfewRequest";
CREATE TABLE "new_PassRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "residentName" TEXT NOT NULL,
    "todayDate" DATETIME NOT NULL,
    "datesRequested" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "choreCoveredById" TEXT,
    "choreCoverageSignature" TEXT,
    "residentSignature" TEXT NOT NULL,
    "signatureDate" DATETIME NOT NULL,
    "adminName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminSignature" TEXT,
    "decisionDate" DATETIME,
    "assignedCaseworkerId" TEXT,
    "userId" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PassRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PassRequest" ("adminName", "adminSignature", "choreCoverageSignature", "datesRequested", "decisionDate", "id", "reason", "residentName", "residentSignature", "signatureDate", "status", "submittedAt", "todayDate", "updatedAt", "userId") SELECT "adminName", "adminSignature", "choreCoverageSignature", "datesRequested", "decisionDate", "id", "reason", "residentName", "residentSignature", "signatureDate", "status", "submittedAt", "todayDate", "updatedAt", "userId" FROM "PassRequest";
DROP TABLE "PassRequest";
ALTER TABLE "new_PassRequest" RENAME TO "PassRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
