import { IdentityModule } from '@modules/identity/identity.module.js';
import { Module } from '@nestjs/common';
import { IssueDataGateway } from './entities/issue-data/issue-data.gateway.js';
import { LinearIssueDataGateway } from './entities/issue-data/linear-issue-data.gateway.js';
import { LinearReferenceDataGateway } from './entities/reference-data/linear-reference-data.gateway.js';
import { ReferenceDataGateway } from './entities/reference-data/reference-data.gateway.js';
import { SyncProgressGateway } from './entities/sync-progress/sync-progress.gateway.js';
import { LinearTeamGateway } from './entities/team-selection/linear-team.gateway.js';
import { TeamSelectionGateway } from './entities/team-selection/team-selection.gateway.js';
import { WebhookEventGateway } from './entities/webhook-event/webhook-event.gateway.js';
import { SyncIssueDataController } from './interface-adapters/controllers/sync-issue-data.controller.js';
import { SyncReferenceDataController } from './interface-adapters/controllers/sync-reference-data.controller.js';
import { TeamSelectionController } from './interface-adapters/controllers/team-selection.controller.js';
import { WebhookController } from './interface-adapters/controllers/webhook.controller.js';
import { IssueDataInPrismaGateway } from './interface-adapters/gateways/issue-data.in-prisma.gateway.js';
import { LinearIssueDataInHttpGateway } from './interface-adapters/gateways/linear-issue-data.in-http.gateway.js';
import { LinearReferenceDataInHttpGateway } from './interface-adapters/gateways/linear-reference-data.in-http.gateway.js';
import { LinearTeamInHttpGateway } from './interface-adapters/gateways/linear-team.in-http.gateway.js';
import { ReferenceDataInPrismaGateway } from './interface-adapters/gateways/reference-data.in-prisma.gateway.js';
import { SyncProgressInPrismaGateway } from './interface-adapters/gateways/sync-progress.in-prisma.gateway.js';
import { TeamSelectionInPrismaGateway } from './interface-adapters/gateways/team-selection.in-prisma.gateway.js';
import { WebhookEventInPrismaGateway } from './interface-adapters/gateways/webhook-event.in-prisma.gateway.js';
import { AvailableTeamsPresenter } from './interface-adapters/presenters/available-teams.presenter.js';
import { SyncProgressPresenter } from './interface-adapters/presenters/sync-progress.presenter.js';
import { TeamSelectionPresenter } from './interface-adapters/presenters/team-selection.presenter.js';
import { GetSyncProgressUsecase } from './usecases/get-sync-progress.usecase.js';
import { GetTeamSelectionUsecase } from './usecases/get-team-selection.usecase.js';
import { ListAvailableTeamsUsecase } from './usecases/list-available-teams.usecase.js';
import { ProcessWebhookEventUsecase } from './usecases/process-webhook-event.usecase.js';
import { SaveTeamSelectionUsecase } from './usecases/save-team-selection.usecase.js';
import { SyncIssueDataUsecase } from './usecases/sync-issue-data.usecase.js';
import { SyncReferenceDataUsecase } from './usecases/sync-reference-data.usecase.js';

@Module({
  imports: [IdentityModule],
  controllers: [
    TeamSelectionController,
    SyncReferenceDataController,
    SyncIssueDataController,
    WebhookController,
  ],
  providers: [
    ListAvailableTeamsUsecase,
    SaveTeamSelectionUsecase,
    GetTeamSelectionUsecase,
    SyncReferenceDataUsecase,
    SyncIssueDataUsecase,
    GetSyncProgressUsecase,
    ProcessWebhookEventUsecase,
    AvailableTeamsPresenter,
    TeamSelectionPresenter,
    SyncProgressPresenter,
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
    {
      provide: IssueDataGateway,
      useClass: IssueDataInPrismaGateway,
    },
    {
      provide: LinearIssueDataGateway,
      useClass: LinearIssueDataInHttpGateway,
    },
    {
      provide: SyncProgressGateway,
      useClass: SyncProgressInPrismaGateway,
    },
    {
      provide: WebhookEventGateway,
      useClass: WebhookEventInPrismaGateway,
    },
  ],
})
export class SynchronizationModule {}
