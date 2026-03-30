import { Module } from '@nestjs/common';
import { LinearConnectionController } from './interface-adapters/controllers/linear-connection.controller.js';
import { ConnectionStatusPresenter } from './interface-adapters/presenters/connection-status.presenter.js';
import { GetConnectionStatusUsecase } from './usecases/get-connection-status.usecase.js';
import { ConnectLinearWorkspaceUsecase } from './usecases/connect-linear-workspace.usecase.js';
import { DisconnectLinearWorkspaceUsecase } from './usecases/disconnect-linear-workspace.usecase.js';
import { RefreshLinearSessionUsecase } from './usecases/refresh-linear-session.usecase.js';
import { LinearWorkspaceConnectionGateway } from './entities/linear-workspace-connection/linear-workspace-connection.gateway.js';
import { LinearWorkspaceConnectionInPrismaGateway } from './interface-adapters/gateways/linear-workspace-connection.in-prisma.gateway.js';
import { LinearApiGateway } from './entities/linear-workspace-connection/linear-api.gateway.js';
import { LinearApiInHttpGateway } from './interface-adapters/gateways/linear-api.in-http.gateway.js';
import { TokenEncryptionGateway } from './entities/linear-workspace-connection/token-encryption.gateway.js';
import { TokenEncryptionInCryptoGateway } from './interface-adapters/gateways/token-encryption.in-crypto.gateway.js';

@Module({
  controllers: [LinearConnectionController],
  providers: [
    GetConnectionStatusUsecase,
    ConnectLinearWorkspaceUsecase,
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
})
export class IdentityModule {}
