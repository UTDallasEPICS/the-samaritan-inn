-- CreateTable
CREATE TABLE "CaseworkerAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "residentId" TEXT NOT NULL,
    "caseworkerEmail" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaseworkerAssignment_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CaseworkerAssignment_residentId_caseworkerEmail_key" ON "CaseworkerAssignment"("residentId", "caseworkerEmail");
