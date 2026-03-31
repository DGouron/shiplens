-- CreateTable
CREATE TABLE "SprintReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cycleId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "cycleName" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "generatedAt" TEXT NOT NULL,
    "executiveSummary" TEXT NOT NULL,
    "trends" TEXT,
    "highlights" TEXT NOT NULL,
    "risks" TEXT NOT NULL,
    "recommendations" TEXT NOT NULL
);
