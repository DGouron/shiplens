import { Module } from '@nestjs/common';
import { IdentityModule } from '@modules/identity/identity.module.js';
import { TeamSelectionController } from './interface-adapters/controllers/team-selection.controller.js';
import { SyncReferenceDataController } from './interface-adapters/controllers/sync-reference-data.controller.js';
import { ListAvailableTeamsUsecase } from './usecases/list-available-teams.usecase.js';
import { SaveTeamSelectionUsecase } from './usecases/save-team-selection.usecase.js';
import { GetTeamSelectionUsecase } from './usecases/get-team-selection.usecase.js';
import { SyncReferenceDataUsecase } from './usecases/sync-reference-data.usecase.js';
import { AvailableTeamsPresenter } from './interface-adapters/presenters/available-teams.presenter.js';
import { TeamSelectionPresenter } from './interface-adapters/presenters/team-selection.presenter.js';
import { TeamSelectionGateway } from './entities/team-selection/team-selection.gateway.js';
import { TeamSelectionInPrismaGateway } from './interface-adapters/gateways/team-selection.in-prisma.gateway.js';
import { LinearTeamGateway } from './entities/team-selection/linear-team.gateway.js';
import { LinearTeamInHttpGateway } from './interface-adapters/gateways/linear-team.in-http.gateway.js';
import { LinearReferenceDataGateway } from './entities/reference-data/linear-reference-data.gateway.js';
import { LinearReferenceDataInHttpGateway } from './interface-adapters/gateways/linear-reference-data.in-http.gateway.js';
import { ReferenceDataGateway } from './entities/reference-data/reference-data.gateway.js';
import { ReferenceDataInPrismaGateway } from './interface-adapters/gateways/reference-data.in-prisma.gateway.js';

@Module({
  imports: [IdentityModule],
  controllers: [TeamSelectionController, SyncReferenceDataController],
  providers: [
    ListAvailableTeamsUsecase,
    SaveTeamSelectionUsecase,
    GetTeamSelectionUsecase,
    SyncReferenceDataUsecase,
    AvailableTeamsPresenter,
    TeamSelectionPresenter,
    {
      provide: TeamSelectionGateway,
      useClass: TeamSelectionInPrismaGateway,
    },
    {
      provide: LinearTeamGateway,
      useClass: LinearTeamInHttpGateway,
    },
    {
      provide: LinearReferenceDataGateway,
      useClass: LinearReferenceDataInHttpGateway,
    },
    {
      provide: ReferenceDataGateway,
      useClass: ReferenceDataInPrismaGateway,
    },
  ],
})
export class SynchronizationModule {}
