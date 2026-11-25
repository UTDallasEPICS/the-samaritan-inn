DROP INDEX "User_salesforceEmail_key";
ALTER TABLE "User" RENAME COLUMN "salesforceEmail" TO "salesforceUsername";
CREATE UNIQUE INDEX "User_salesforceUsername_key" ON "User"("salesforceUsername");
