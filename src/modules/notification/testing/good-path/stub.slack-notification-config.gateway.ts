import { SlackNotificationConfigGateway } from '../../entities/slack-notification-config/slack-notification-config.gateway.js';
import { type SlackNotificationConfig } from '../../entities/slack-notification-config/slack-notification-config.js';

export class StubSlackNotificationConfigGateway extends SlackNotificationConfigGateway {
  private configs: Map<string, SlackNotificationConfig> = new Map();

  async save(config: SlackNotificationConfig): Promise<void> {
    this.configs.set(config.teamId, config);
  }

  async findByTeamId(teamId: string): Promise<SlackNotificationConfig | null> {
    return this.configs.get(teamId) ?? null;
  }
}
