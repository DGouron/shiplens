import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { SlackNotificationConfig } from '../entities/slack-notification-config/slack-notification-config.js';
import { SlackNotificationConfigGateway } from '../entities/slack-notification-config/slack-notification-config.gateway.js';
import { WebhookNotConfiguredError } from '../entities/slack-notification-config/slack-notification-config.errors.js';

interface ToggleSlackNotificationParams {
  teamId: string;
  enabled: boolean;
}

@Injectable()
export class ToggleSlackNotificationUsecase
  implements Usecase<ToggleSlackNotificationParams, SlackNotificationConfig>
{
  constructor(private readonly configGateway: SlackNotificationConfigGateway) {}

  async execute(params: ToggleSlackNotificationParams): Promise<SlackNotificationConfig> {
    const existing = await this.configGateway.findByTeamId(params.teamId);
    if (!existing) {
      throw new WebhookNotConfiguredError();
    }

    const updated = SlackNotificationConfig.create({
      id: existing.id,
      teamId: existing.teamId,
      webhookUrl: existing.webhookUrl,
      enabled: params.enabled,
    });

    await this.configGateway.save(updated);

    return updated;
  }
}
