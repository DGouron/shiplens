import { Module } from '@nestjs/common';
import { SlackNotificationController } from './interface-adapters/controllers/slack-notification.controller.js';
import { ConfigureSlackWebhookUsecase } from './usecases/configure-slack-webhook.usecase.js';
import { ToggleSlackNotificationUsecase } from './usecases/toggle-slack-notification.usecase.js';
import { SendReportToSlackUsecase } from './usecases/send-report-to-slack.usecase.js';
import { SlackNotificationConfigPresenter } from './interface-adapters/presenters/slack-notification-config.presenter.js';
import { SlackNotificationConfigGateway } from './entities/slack-notification-config/slack-notification-config.gateway.js';
import { SlackNotificationConfigInPrismaGateway } from './interface-adapters/gateways/slack-notification-config.in-prisma.gateway.js';
import { SlackMessengerGateway } from './entities/slack-notification-config/slack-messenger.gateway.js';
import { SlackMessengerWithHttpGateway } from './interface-adapters/gateways/slack-messenger.with-http.gateway.js';
import { SlackReportDataGateway } from './entities/slack-notification-config/slack-report-data.gateway.js';
import { SlackReportDataInPrismaGateway } from './interface-adapters/gateways/slack-report-data.in-prisma.gateway.js';

@Module({
  controllers: [SlackNotificationController],
  providers: [
    ConfigureSlackWebhookUsecase,
    ToggleSlackNotificationUsecase,
    SendReportToSlackUsecase,
    SlackNotificationConfigPresenter,
    {
      provide: SlackNotificationConfigGateway,
      useClass: SlackNotificationConfigInPrismaGateway,
    },
    {
      provide: SlackMessengerGateway,
      useClass: SlackMessengerWithHttpGateway,
    },
    {
      provide: SlackReportDataGateway,
      useClass: SlackReportDataInPrismaGateway,
    },
  ],
})
export class NotificationModule {}
