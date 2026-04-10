import { type SlackNotificationConfig } from './slack-notification-config.js';

export abstract class SlackNotificationConfigGateway {
  abstract findByTeamId(
    teamId: string,
  ): Promise<SlackNotificationConfig | null>;
  abstract save(config: SlackNotificationConfig): Promise<void>;
}
