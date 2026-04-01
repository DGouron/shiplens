import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { SlackNotificationConfig } from '../entities/slack-notification-config/slack-notification-config.js';
import { SlackNotificationConfigGateway } from '../entities/slack-notification-config/slack-notification-config.gateway.js';
import { SlackMessengerGateway } from '../entities/slack-notification-config/slack-messenger.gateway.js';
import { InvalidWebhookUrlError } from '../entities/slack-notification-config/slack-notification-config.errors.js';
import { SlackDeliveryFailedError } from '../entities/slack-notification-config/slack-notification-config.errors.js';

interface ConfigureSlackWebhookParams {
  teamId: string;
  webhookUrl: string;
}

@Injectable()
export class ConfigureSlackWebhookUsecase
  implements Usecase<ConfigureSlackWebhookParams, SlackNotificationConfig>
{
  constructor(
    private readonly configGateway: SlackNotificationConfigGateway,
    private readonly messengerGateway: SlackMessengerGateway,
  ) {}

  async execute(params: ConfigureSlackWebhookParams): Promise<SlackNotificationConfig> {
    let config: SlackNotificationConfig;
    try {
      config = SlackNotificationConfig.create({
        id: crypto.randomUUID(),
        teamId: params.teamId,
        webhookUrl: params.webhookUrl,
        enabled: true,
      });
    } catch {
      throw new InvalidWebhookUrlError();
    }

    try {
      await this.messengerGateway.send(config.webhookUrl, {
        text: 'Shiplens - Webhook Slack configuré avec succès !',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'Shiplens - Webhook Slack configuré avec succès !',
            },
          },
        ],
      });
    } catch {
      throw new SlackDeliveryFailedError();
    }

    await this.configGateway.save(config);

    return config;
  }
}
