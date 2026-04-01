-- CreateTable
CREATE TABLE "SlackNotificationConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "webhookUrl" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SlackNotificationConfig_teamId_key" ON "SlackNotificationConfig"("teamId");
