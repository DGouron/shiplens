import { Module } from '@nestjs/common';
import { AnalyticsModule } from '../analytics/analytics.module.js';
import { SlackNotificationController } from './interface-adapters/controllers/slack-notification.controller.js';
import { ConfigureSlackWebhookUsecase } from './usecases/configure-slack-webhook.usecase.js';
import { SendReportOnSlackUsecase } from './usecases/send-report-on-slack.usecase.js';
import { ConfigureTeamAlertChannelUsecase } from './usecases/configure-team-alert-channel.usecase.js';
import { AlertBlockedIssuesOnSlackUsecase } from './usecases/alert-blocked-issues-on-slack.usecase.js';
import { SlackNotificationConfigGateway } from './entities/slack-notification-config/slack-notification-config.gateway.js';
import { SlackNotificationConfigInPrismaGateway } from './interface-adapters/gateways/slack-notification-config.in-prisma.gateway.js';
import { SlackMessengerGateway } from './entities/slack-notification-config/slack-messenger.gateway.js';
import { SlackMessengerInHttpGateway } from './interface-adapters/gateways/slack-messenger.in-http.gateway.js';
import { TeamAlertChannelGateway } from './entities/team-alert-channel/team-alert-channel.gateway.js';
import { TeamAlertChannelInPrismaGateway } from './interface-adapters/gateways/team-alert-channel.in-prisma.gateway.js';
import { BlockedIssueAlertDataGateway } from './entities/team-alert-channel/blocked-issue-alert-data.gateway.js';
import { BlockedIssueAlertDataInPrismaGateway } from './interface-adapters/gateways/blocked-issue-alert-data.in-prisma.gateway.js';
import { SlackAlertLogGateway } from './entities/team-alert-channel/slack-alert-log.gateway.js';
import { SlackAlertLogInPrismaGateway } from './interface-adapters/gateways/slack-alert-log.in-prisma.gateway.js';
import { BlockedIssueAlertScheduler } from './interface-adapters/controllers/blocked-issue-alert.scheduler.js';

@Module({
  imports: [AnalyticsModule],
  controllers: [SlackNotificationController],
  providers: [
    ConfigureSlackWebhookUsecase,
    SendReportOnSlackUsecase,
    ConfigureTeamAlertChannelUsecase,
    AlertBlockedIssuesOnSlackUsecase,
    BlockedIssueAlertScheduler,
    {
      provide: SlackNotificationConfigGateway,
      useClass: SlackNotificationConfigInPrismaGateway,
    },
    {
      provide: SlackMessengerGateway,
      useClass: SlackMessengerInHttpGateway,
    },
    {
      provide: TeamAlertChannelGateway,
      useClass: TeamAlertChannelInPrismaGateway,
    },
    {
      provide: BlockedIssueAlertDataGateway,
      useClass: BlockedIssueAlertDataInPrismaGateway,
    },
    {
      provide: SlackAlertLogGateway,
      useClass: SlackAlertLogInPrismaGateway,
    },
  ],
})
export class NotificationModule {}
