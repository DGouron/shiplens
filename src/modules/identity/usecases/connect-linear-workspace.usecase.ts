import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { LinearWorkspaceConnectionGateway } from '../entities/linear-workspace-connection/linear-workspace-connection.gateway.js';
import { LinearApiGateway } from '../entities/linear-workspace-connection/linear-api.gateway.js';
import { TokenEncryptionGateway } from '../entities/linear-workspace-connection/token-encryption.gateway.js';
import { LinearWorkspaceConnection } from '../entities/linear-workspace-connection/linear-workspace-connection.js';
import { type ExchangeCodeResult } from '../entities/linear-workspace-connection/linear-api.gateway.js';
import { LinearConnectionRefusedError, InsufficientLinearPermissionsError } from '../entities/linear-workspace-connection/linear-workspace-connection.errors.js';

interface ConnectLinearWorkspaceParams {
  code: string;
  redirectUri: string;
}

export const REQUIRED_SCOPES = ['read', 'write', 'issues:create'];

@Injectable()
export class ConnectLinearWorkspaceUsecase implements Usecase<ConnectLinearWorkspaceParams, void> {
  constructor(
    private readonly connectionGateway: LinearWorkspaceConnectionGateway,
    private readonly linearApiGateway: LinearApiGateway,
    private readonly tokenEncryptionGateway: TokenEncryptionGateway,
  ) {}

  async execute(params: ConnectLinearWorkspaceParams): Promise<void> {
    let exchangeResult: ExchangeCodeResult;
    try {
      exchangeResult = await this.linearApiGateway.exchangeCode(params.code, params.redirectUri);
    } catch {
      throw new LinearConnectionRefusedError();
    }

    const hasAllRequiredScopes = REQUIRED_SCOPES.every((scope) =>
      exchangeResult.scopes.includes(scope),
    );
    if (!hasAllRequiredScopes) {
      throw new InsufficientLinearPermissionsError();
    }

    const workspaceInfo = await this.linearApiGateway.getWorkspaceInfo(exchangeResult.accessToken);

    const encryptedAccessToken = await this.tokenEncryptionGateway.encrypt(
      exchangeResult.accessToken,
    );
    const encryptedRefreshToken = await this.tokenEncryptionGateway.encrypt(
      exchangeResult.refreshToken,
    );

    const existing = await this.connectionGateway.get();
    if (existing) {
      await this.connectionGateway.delete();
    }

    const connection = LinearWorkspaceConnection.create({
      id: crypto.randomUUID(),
      workspaceId: workspaceInfo.id,
      workspaceName: workspaceInfo.name,
      encryptedAccessToken,
      encryptedRefreshToken,
      grantedScopes: exchangeResult.scopes,
      status: 'connected',
      connectedAt: new Date(),
      updatedAt: new Date(),
    });

    await this.connectionGateway.save(connection);
  }
}
