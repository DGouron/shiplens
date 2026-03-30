import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import { LinearWorkspaceConnectionGateway } from '../../entities/linear-workspace-connection/linear-workspace-connection.gateway.js';
import { LinearWorkspaceConnection } from '../../entities/linear-workspace-connection/linear-workspace-connection.js';

@Injectable()
export class LinearWorkspaceConnectionInPrismaGateway extends LinearWorkspaceConnectionGateway {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async save(connection: LinearWorkspaceConnection): Promise<void> {
    await this.prisma.linearWorkspaceConnection.upsert({
      where: { id: connection.id },
      update: {
        workspaceId: connection.workspaceId,
        workspaceName: connection.workspaceName,
        encryptedAccessToken: connection.encryptedAccessToken,
        encryptedRefreshToken: connection.encryptedRefreshToken,
        grantedScopes: connection.grantedScopes.join(','),
        status: connection.status,
        connectedAt: connection.connectedAt,
      },
      create: {
        id: connection.id,
        workspaceId: connection.workspaceId,
        workspaceName: connection.workspaceName,
        encryptedAccessToken: connection.encryptedAccessToken,
        encryptedRefreshToken: connection.encryptedRefreshToken,
        grantedScopes: connection.grantedScopes.join(','),
        status: connection.status,
        connectedAt: connection.connectedAt,
      },
    });
  }

  async get(): Promise<LinearWorkspaceConnection | null> {
    const record = await this.prisma.linearWorkspaceConnection.findFirst();
    if (!record) {
      return null;
    }

    return LinearWorkspaceConnection.create({
      id: record.id,
      workspaceId: record.workspaceId,
      workspaceName: record.workspaceName,
      encryptedAccessToken: record.encryptedAccessToken,
      encryptedRefreshToken: record.encryptedRefreshToken,
      grantedScopes: record.grantedScopes.split(','),
      status: record.status,
      connectedAt: record.connectedAt,
      updatedAt: record.updatedAt,
    });
  }

  async delete(): Promise<void> {
    await this.prisma.linearWorkspaceConnection.deleteMany();
  }
}
