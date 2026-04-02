import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { LinearWorkspaceConnectionGateway } from '../entities/linear-workspace-connection/linear-workspace-connection.gateway.js';
import { LinearApiGateway } from '../entities/linear-workspace-connection/linear-api.gateway.js';
import { TokenEncryptionGateway } from '../entities/linear-workspace-connection/token-encryption.gateway.js';
import { LinearWorkspaceConnection } from '../entities/linear-workspace-connection/linear-workspace-connection.js';
import { InvalidLinearApiKeyError } from '../entities/linear-workspace-connection/linear-workspace-connection.errors.js';
import { REQUIRED_SCOPES } from './connect-linear-workspace.usecase.js';

interface ConnectWithApiKeyParams {
  apiKey: string;
}

@Injectable()
export class ConnectWithApiKeyUsecase implements Usecase<ConnectWithApiKeyParams, void> {
  constructor(
    private readonly connectionGateway: LinearWorkspaceConnectionGateway,
    private readonly linearApiGateway: LinearApiGateway,
    private readonly tokenEncryptionGateway: TokenEncryptionGateway,
  ) {}

  async execute(params: ConnectWithApiKeyParams): Promise<void> {
    let workspaceInfo;
    try {
      workspaceInfo = await this.linearApiGateway.getWorkspaceInfo(params.apiKey);
    } catch {
      throw new InvalidLinearApiKeyError();
    }

    const encryptedAccessToken = await this.tokenEncryptionGateway.encrypt(params.apiKey);

    const existing = await this.connectionGateway.get();
    if (existing) {
      await this.connectionGateway.delete();
    }

    const connection = LinearWorkspaceConnection.create({
      id: crypto.randomUUID(),
      workspaceId: workspaceInfo.id,
      workspaceName: workspaceInfo.name,
      encryptedAccessToken,
      encryptedRefreshToken: '',
      grantedScopes: [...REQUIRED_SCOPES],
      status: 'connected',
      connectedAt: new Date(),
      updatedAt: new Date(),
    });

    await this.connectionGateway.save(connection);
  }
}
