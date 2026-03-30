import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { LinearWorkspaceConnectionGateway } from '../entities/linear-workspace-connection/linear-workspace-connection.gateway.js';
import { LinearApiGateway, type RefreshTokenResult } from '../entities/linear-workspace-connection/linear-api.gateway.js';
import { TokenEncryptionGateway } from '../entities/linear-workspace-connection/token-encryption.gateway.js';
import { LinearWorkspaceConnection } from '../entities/linear-workspace-connection/linear-workspace-connection.js';
import { NoLinearConnectionError, LinearSessionExpiredError } from '../entities/linear-workspace-connection/linear-workspace-connection.errors.js';

@Injectable()
export class RefreshLinearSessionUsecase implements Usecase<void, void> {
  constructor(
    private readonly connectionGateway: LinearWorkspaceConnectionGateway,
    private readonly linearApiGateway: LinearApiGateway,
    private readonly tokenEncryptionGateway: TokenEncryptionGateway,
  ) {}

  async execute(): Promise<void> {
    const connection = await this.connectionGateway.get();
    if (!connection) {
      throw new NoLinearConnectionError();
    }

    const refreshToken = await this.tokenEncryptionGateway.decrypt(
      connection.encryptedRefreshToken,
    );

    let refreshResult: RefreshTokenResult;
    try {
      refreshResult = await this.linearApiGateway.refreshToken(refreshToken);
    } catch {
      throw new LinearSessionExpiredError();
    }

    const encryptedAccessToken = await this.tokenEncryptionGateway.encrypt(
      refreshResult.accessToken,
    );
    const encryptedRefreshToken = await this.tokenEncryptionGateway.encrypt(
      refreshResult.refreshToken,
    );

    const updatedConnection = LinearWorkspaceConnection.create({
      id: connection.id,
      workspaceId: connection.workspaceId,
      workspaceName: connection.workspaceName,
      encryptedAccessToken,
      encryptedRefreshToken,
      grantedScopes: connection.grantedScopes,
      status: 'connected',
      connectedAt: connection.connectedAt,
      updatedAt: new Date(),
    });

    await this.connectionGateway.save(updatedConnection);
  }
}
