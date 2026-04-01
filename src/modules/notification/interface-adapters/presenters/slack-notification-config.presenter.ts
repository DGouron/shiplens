import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';
import { type SlackNotificationConfig } from '../../entities/slack-notification-config/slack-notification-config.js';

export interface SlackNotificationConfigDto {
  teamId: string;
  webhookUrl: string;
  enabled: boolean;
}

@Injectable()
export class SlackNotificationConfigPresenter
  implements Presenter<SlackNotificationConfig, SlackNotificationConfigDto>
{
  present(config: SlackNotificationConfig): SlackNotificationConfigDto {
    return {
      teamId: config.teamId,
      webhookUrl: config.webhookUrl,
      enabled: config.enabled,
    };
  }
}
