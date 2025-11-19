-- CreateTable
CREATE TABLE "CurfewRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reason" TEXT
);
