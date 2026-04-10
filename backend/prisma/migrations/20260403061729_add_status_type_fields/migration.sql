-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Issue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "statusName" TEXT NOT NULL,
    "statusType" TEXT NOT NULL DEFAULT 'unstarted',
    "points" INTEGER,
    "labelIds" TEXT NOT NULL,
    "assigneeName" TEXT,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL,
    "deletedAt" TEXT
);
INSERT INTO "new_Issue" ("assigneeName", "createdAt", "deletedAt", "externalId", "id", "labelIds", "points", "statusName", "teamId", "title", "updatedAt") SELECT "assigneeName", "createdAt", "deletedAt", "externalId", "id", "labelIds", "points", "statusName", "teamId", "title", "updatedAt" FROM "Issue";
DROP TABLE "Issue";
ALTER TABLE "new_Issue" RENAME TO "Issue";
CREATE UNIQUE INDEX "Issue_externalId_teamId_key" ON "Issue"("externalId", "teamId");
CREATE TABLE "new_StateTransition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT NOT NULL,
    "issueExternalId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "fromStatusName" TEXT,
    "fromStatusType" TEXT,
    "toStatusName" TEXT NOT NULL,
    "toStatusType" TEXT NOT NULL DEFAULT 'unstarted',
    "occurredAt" TEXT NOT NULL
);
INSERT INTO "new_StateTransition" ("externalId", "fromStatusName", "id", "issueExternalId", "occurredAt", "teamId", "toStatusName") SELECT "externalId", "fromStatusName", "id", "issueExternalId", "occurredAt", "teamId", "toStatusName" FROM "StateTransition";
DROP TABLE "StateTransition";
ALTER TABLE "new_StateTransition" RENAME TO "StateTransition";
CREATE UNIQUE INDEX "StateTransition_externalId_teamId_key" ON "StateTransition"("externalId", "teamId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
