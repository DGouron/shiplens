import { SlackNotificationConfigGateway } from '../../entities/slack-notification-config/slack-notification-config.gateway.js';
import { type SlackNotificationConfig } from '../../entities/slack-notification-config/slack-notification-config.js';
import { GatewayError } from '@shared/foundation/gateway-error.js';

export class FailingSlackNotificationConfigGateway extends SlackNotificationConfigGateway {
  async save(_config: SlackNotificationConfig): Promise<void> {
    throw new GatewayError('Failed to save slack notification config');
  }

  async findByTeamId(_teamId: string): Promise<SlackNotificationConfig | null> {
    throw new GatewayError('Failed to find slack notification config');
  }
}
