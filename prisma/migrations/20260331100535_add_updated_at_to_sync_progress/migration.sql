/*
  Warnings:

  - Added the required column `updatedAt` to the `SyncProgress` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SyncProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "totalIssues" INTEGER NOT NULL,
    "syncedIssues" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "cursor" TEXT,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SyncProgress" ("cursor", "id", "status", "syncedIssues", "teamId", "totalIssues") SELECT "cursor", "id", "status", "syncedIssues", "teamId", "totalIssues" FROM "SyncProgress";
DROP TABLE "SyncProgress";
ALTER TABLE "new_SyncProgress" RENAME TO "SyncProgress";
CREATE UNIQUE INDEX "SyncProgress_teamId_key" ON "SyncProgress"("teamId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
