-- CreateTable
CREATE TABLE "Label" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "WorkflowStatus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT NOT NULL,
    "projectExternalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "projectTeamId" TEXT NOT NULL,
    CONSTRAINT "Milestone_projectExternalId_projectTeamId_fkey" FOREIGN KEY ("projectExternalId", "projectTeamId") REFERENCES "Project" ("externalId", "teamId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Label_externalId_teamId_key" ON "Label"("externalId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowStatus_externalId_teamId_key" ON "WorkflowStatus"("externalId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_externalId_teamId_key" ON "TeamMember"("externalId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_externalId_teamId_key" ON "Project"("externalId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Milestone_externalId_projectExternalId_key" ON "Milestone"("externalId", "projectExternalId");
