-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "statusName" TEXT NOT NULL,
    "points" INTEGER,
    "labelIds" TEXT NOT NULL,
    "assigneeName" TEXT,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Cycle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT,
    "startsAt" TEXT NOT NULL,
    "endsAt" TEXT NOT NULL,
    "issueExternalIds" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "StateTransition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT NOT NULL,
    "issueExternalId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "fromStatusName" TEXT,
    "toStatusName" TEXT NOT NULL,
    "occurredAt" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SyncProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "totalIssues" INTEGER NOT NULL,
    "syncedIssues" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "cursor" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Issue_externalId_teamId_key" ON "Issue"("externalId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Cycle_externalId_teamId_key" ON "Cycle"("externalId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "StateTransition_externalId_teamId_key" ON "StateTransition"("externalId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "SyncProgress_teamId_key" ON "SyncProgress"("teamId");
