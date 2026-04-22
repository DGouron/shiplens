-- CreateTable
CREATE TABLE "CycleThemeSet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cycleId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "themesJson" TEXT NOT NULL,
    "generatedAt" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CycleThemeSet_cycleId_key" ON "CycleThemeSet"("cycleId");
