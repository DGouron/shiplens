import { SlackNotificationConfigGateway } from '../../entities/slack-notification-config/slack-notification-config.gateway.js';
import { type SlackNotificationConfig } from '../../entities/slack-notification-config/slack-notification-config.js';

export class StubSlackNotificationConfigGateway extends SlackNotificationConfigGateway {
  private configs: SlackNotificationConfig[] = [];

  async findByTeamId(teamId: string): Promise<SlackNotificationConfig | null> {
    return this.configs.find((config) => config.teamId === teamId) ?? null;
  }

  async save(config: SlackNotificationConfig): Promise<void> {
    const existingIndex = this.configs.findIndex(
      (existing) => existing.teamId === config.teamId,
    );
    if (existingIndex >= 0) {
      this.configs[existingIndex] = config;
    } else {
      this.configs.push(config);
    }
  }
}
