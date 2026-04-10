-- CreateTable
CREATE TABLE "StatusThreshold" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "statusName" TEXT NOT NULL,
    "thresholdHours" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "BlockedIssueAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "issueExternalId" TEXT NOT NULL,
    "issueTitle" TEXT NOT NULL,
    "issueUuid" TEXT NOT NULL,
    "statusName" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "durationHours" INTEGER NOT NULL,
    "detectedAt" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "resolvedAt" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "StatusThreshold_statusName_key" ON "StatusThreshold"("statusName");
