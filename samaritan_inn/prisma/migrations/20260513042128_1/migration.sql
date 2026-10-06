-- AlterTable
ALTER TABLE "PassRequest" ADD COLUMN "commentsNotes" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WorkSchedule" (
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
    "adminName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "decisionDate" DATETIME,
    "commentsNotes" TEXT,
    "assignedCaseworkerId" TEXT,
    "userId" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WorkSchedule" ("employerLocation", "employerName", "employmentStatus", "enteredByInitials", "estimatedTravelTime", "id", "monthOf", "residentName", "residentSignature", "room", "signatureDate", "submittedAt", "transportation", "updatedAt", "userId", "weekOf") SELECT "employerLocation", "employerName", "employmentStatus", "enteredByInitials", "estimatedTravelTime", "id", "monthOf", "residentName", "residentSignature", "room", "signatureDate", "submittedAt", "transportation", "updatedAt", "userId", "weekOf" FROM "WorkSchedule";
DROP TABLE "WorkSchedule";
ALTER TABLE "new_WorkSchedule" RENAME TO "WorkSchedule";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
