import { Logger, Module, type OnApplicationBootstrap } from '@nestjs/common';
import { LinearApiGateway } from './entities/linear-workspace-connection/linear-api.gateway.js';
import { LinearWorkspaceConnectionGateway } from './entities/linear-workspace-connection/linear-workspace-connection.gateway.js';
import { TokenEncryptionGateway } from './entities/linear-workspace-connection/token-encryption.gateway.js';
import { LinearConnectionController } from './interface-adapters/controllers/linear-connection.controller.js';
import { LinearApiInHttpGateway } from './interface-adapters/gateways/linear-api.in-http.gateway.js';
import { LinearWorkspaceConnectionInPrismaGateway } from './interface-adapters/gateways/linear-workspace-connection.in-prisma.gateway.js';
import { TokenEncryptionInCryptoGateway } from './interface-adapters/gateways/token-encryption.in-crypto.gateway.js';
import { ConnectionStatusPresenter } from './interface-adapters/presenters/connection-status.presenter.js';
import { ConnectLinearWorkspaceUsecase } from './usecases/connect-linear-workspace.usecase.js';
import { ConnectWithApiKeyUsecase } from './usecases/connect-with-api-key.usecase.js';
import { DisconnectLinearWorkspaceUsecase } from './usecases/disconnect-linear-workspace.usecase.js';
import { GetConnectionStatusUsecase } from './usecases/get-connection-status.usecase.js';
import { RefreshLinearSessionUsecase } from './usecases/refresh-linear-session.usecase.js';

@Module({
  controllers: [LinearConnectionController],
  providers: [
    GetConnectionStatusUsecase,
    ConnectLinearWorkspaceUsecase,
    ConnectWithApiKeyUsecase,
    DisconnectLinearWorkspaceUsecase,
    RefreshLinearSessionUsecase,
    ConnectionStatusPresenter,
    {
      provide: LinearWorkspaceConnectionGateway,
      useClass: LinearWorkspaceConnectionInPrismaGateway,
    },
    {
      provide: LinearApiGateway,
      useFactory: () =>
        new LinearApiInHttpGateway(
          process.env.LINEAR_CLIENT_ID ?? '',
          process.env.LINEAR_CLIENT_SECRET ?? '',
        ),
    },
    {
      provide: TokenEncryptionGateway,
      useFactory: () =>
        new TokenEncryptionInCryptoGateway(process.env.ENCRYPTION_KEY ?? ''),
    },
  ],
  exports: [LinearWorkspaceConnectionGateway, TokenEncryptionGateway],
})
export class IdentityModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(IdentityModule.name);

  constructor(private readonly connectWithApiKey: ConnectWithApiKeyUsecase) {}

  async onApplicationBootstrap(): Promise<void> {
    const apiKey = process.env.LINEAR_PERSONAL_API_KEY;
    if (!apiKey) return;

    try {
      await this.connectWithApiKey.execute({ apiKey });
      this.logger.log('Linear connected via Personal API Key');
    } catch (error) {
      this.logger.warn('Failed to connect Linear with Personal API Key', error);
    }
  }
}
