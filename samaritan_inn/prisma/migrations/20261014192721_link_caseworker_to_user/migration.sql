-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Caseworker" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "room" TEXT,
    "availability" TEXT,
    "bookingUrl" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Caseworker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Caseworker" ("availability", "bookingUrl", "createdAt", "email", "id", "name", "phone", "room", "title", "updatedAt") SELECT "availability", "bookingUrl", "createdAt", "email", "id", "name", "phone", "room", "title", "updatedAt" FROM "Caseworker";
DROP TABLE "Caseworker";
ALTER TABLE "new_Caseworker" RENAME TO "Caseworker";
CREATE UNIQUE INDEX "Caseworker_email_key" ON "Caseworker"("email");
CREATE UNIQUE INDEX "Caseworker_userId_key" ON "Caseworker"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
