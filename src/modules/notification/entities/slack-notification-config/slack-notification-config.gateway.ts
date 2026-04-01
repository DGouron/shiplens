import { type SlackNotificationConfig } from './slack-notification-config.js';

export abstract class SlackNotificationConfigGateway {
  abstract save(config: SlackNotificationConfig): Promise<void>;
  abstract findByTeamId(teamId: string): Promise<SlackNotificationConfig | null>;
}
