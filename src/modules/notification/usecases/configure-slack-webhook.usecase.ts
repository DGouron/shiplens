import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { SlackNotificationConfigGateway } from '../entities/slack-notification-config/slack-notification-config.gateway.js';
import { SlackMessengerGateway } from '../entities/slack-notification-config/slack-messenger.gateway.js';
import { SlackNotificationConfig } from '../entities/slack-notification-config/slack-notification-config.js';
import { InvalidSlackWebhookUrlError } from '../entities/slack-notification-config/slack-notification-config.errors.js';
import { slackNotificationConfigGuard } from '../entities/slack-notification-config/slack-notification-config.guard.js';

interface ConfigureSlackWebhookParams {
  teamId: string;
  webhookUrl: string;
}

@Injectable()
export class ConfigureSlackWebhookUsecase
  implements Usecase<ConfigureSlackWebhookParams, void>
{
  constructor(
    private readonly configGateway: SlackNotificationConfigGateway,
    private readonly messengerGateway: SlackMessengerGateway,
  ) {}

  async execute(params: ConfigureSlackWebhookParams): Promise<void> {
    const validationResult = slackNotificationConfigGuard.isValid({
      id: randomUUID(),
      teamId: params.teamId,
      webhookUrl: params.webhookUrl,
      enabled: true,
    });

    if (!validationResult) {
      throw new InvalidSlackWebhookUrlError();
    }

    const existing = await this.configGateway.findByTeamId(params.teamId);

    const config = SlackNotificationConfig.create({
      id: existing?.id ?? randomUUID(),
      teamId: params.teamId,
      webhookUrl: params.webhookUrl,
      enabled: true,
    });

    await this.configGateway.save(config);
    await this.messengerGateway.sendTestMessage(params.webhookUrl);
  }
}
