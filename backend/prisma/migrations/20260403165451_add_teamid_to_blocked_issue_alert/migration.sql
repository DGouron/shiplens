-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BlockedIssueAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "issueExternalId" TEXT NOT NULL,
    "issueTitle" TEXT NOT NULL,
    "issueUuid" TEXT NOT NULL,
    "teamId" TEXT NOT NULL DEFAULT '',
    "statusName" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "durationHours" INTEGER NOT NULL,
    "detectedAt" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "resolvedAt" TEXT
);
INSERT INTO "new_BlockedIssueAlert" ("active", "detectedAt", "durationHours", "id", "issueExternalId", "issueTitle", "issueUuid", "resolvedAt", "severity", "statusName") SELECT "active", "detectedAt", "durationHours", "id", "issueExternalId", "issueTitle", "issueUuid", "resolvedAt", "severity", "statusName" FROM "BlockedIssueAlert";
DROP TABLE "BlockedIssueAlert";
ALTER TABLE "new_BlockedIssueAlert" RENAME TO "BlockedIssueAlert";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
