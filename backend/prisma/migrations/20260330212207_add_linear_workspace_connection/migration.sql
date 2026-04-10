-- CreateTable
CREATE TABLE "LinearWorkspaceConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspaceId" TEXT NOT NULL,
    "workspaceName" TEXT NOT NULL,
    "encryptedAccessToken" TEXT NOT NULL,
    "encryptedRefreshToken" TEXT NOT NULL,
    "grantedScopes" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "connectedAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "LinearWorkspaceConnection_workspaceId_key" ON "LinearWorkspaceConnection"("workspaceId");
