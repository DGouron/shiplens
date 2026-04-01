import { Module } from '@nestjs/common';
import { AnalyticsModule } from '../analytics/analytics.module.js';
import { SlackNotificationController } from './interface-adapters/controllers/slack-notification.controller.js';
import { ConfigureSlackWebhookUsecase } from './usecases/configure-slack-webhook.usecase.js';
import { SendReportOnSlackUsecase } from './usecases/send-report-on-slack.usecase.js';
import { SlackNotificationConfigGateway } from './entities/slack-notification-config/slack-notification-config.gateway.js';
import { SlackNotificationConfigInPrismaGateway } from './interface-adapters/gateways/slack-notification-config.in-prisma.gateway.js';
import { SlackMessengerGateway } from './entities/slack-notification-config/slack-messenger.gateway.js';
import { SlackMessengerInHttpGateway } from './interface-adapters/gateways/slack-messenger.in-http.gateway.js';

@Module({
  imports: [AnalyticsModule],
  controllers: [SlackNotificationController],
  providers: [
    ConfigureSlackWebhookUsecase,
    SendReportOnSlackUsecase,
    {
      provide: SlackNotificationConfigGateway,
      useClass: SlackNotificationConfigInPrismaGateway,
    },
    {
      provide: SlackMessengerGateway,
      useClass: SlackMessengerInHttpGateway,
    },
  ],
})
export class NotificationModule {}
