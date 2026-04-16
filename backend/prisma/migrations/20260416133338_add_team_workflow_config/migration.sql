-- CreateTable
CREATE TABLE "TeamWorkflowConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "startedStatuses" TEXT NOT NULL,
    "completedStatuses" TEXT NOT NULL,
    "source" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamWorkflowConfig_teamId_key" ON "TeamWorkflowConfig"("teamId");
