import { Module } from '@nestjs/common';
import { IdentityModule } from '@modules/identity/identity.module.js';
import { TeamSelectionController } from './interface-adapters/controllers/team-selection.controller.js';
import { ListAvailableTeamsUsecase } from './usecases/list-available-teams.usecase.js';
import { SaveTeamSelectionUsecase } from './usecases/save-team-selection.usecase.js';
import { GetTeamSelectionUsecase } from './usecases/get-team-selection.usecase.js';
import { AvailableTeamsPresenter } from './interface-adapters/presenters/available-teams.presenter.js';
import { TeamSelectionPresenter } from './interface-adapters/presenters/team-selection.presenter.js';
import { TeamSelectionGateway } from './entities/team-selection/team-selection.gateway.js';
import { TeamSelectionInPrismaGateway } from './interface-adapters/gateways/team-selection.in-prisma.gateway.js';
import { LinearTeamGateway } from './entities/team-selection/linear-team.gateway.js';
import { LinearTeamInHttpGateway } from './interface-adapters/gateways/linear-team.in-http.gateway.js';

@Module({
  imports: [IdentityModule],
  controllers: [TeamSelectionController],
  providers: [
    ListAvailableTeamsUsecase,
    SaveTeamSelectionUsecase,
    GetTeamSelectionUsecase,
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
  ],
})
export class SynchronizationModule {}
