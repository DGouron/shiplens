-- CreateTable
CREATE TABLE "SelectedTeam" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "teamName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SelectedProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "teamId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SelectedTeam_teamId_key" ON "SelectedTeam"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "SelectedProject_projectId_key" ON "SelectedProject"("projectId");
