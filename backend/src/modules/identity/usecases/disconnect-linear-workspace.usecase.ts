import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { LinearApiGateway } from '../entities/linear-workspace-connection/linear-api.gateway.js';
import { NoLinearConnectionError } from '../entities/linear-workspace-connection/linear-workspace-connection.errors.js';
import { LinearWorkspaceConnectionGateway } from '../entities/linear-workspace-connection/linear-workspace-connection.gateway.js';
import { TokenEncryptionGateway } from '../entities/linear-workspace-connection/token-encryption.gateway.js';

@Injectable()
export class DisconnectLinearWorkspaceUsecase implements Usecase<void, void> {
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

    const accessToken = await this.tokenEncryptionGateway.decrypt(
      connection.encryptedAccessToken,
    );

    await this.linearApiGateway.revokeToken(accessToken);
    await this.connectionGateway.delete();
  }
}
