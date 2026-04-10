-- CreateTable
CREATE TABLE "TeamAlertChannel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "webhookUrl" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SlackAlertLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "issueExternalId" TEXT NOT NULL,
    "sentAt" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamAlertChannel_teamId_key" ON "TeamAlertChannel"("teamId");
