import { SlackMessengerGateway, type SlackMessage } from '../../entities/slack-notification-config/slack-messenger.gateway.js';
import { GatewayError } from '@shared/foundation/gateway-error.js';

export class FailingSlackMessengerGateway extends SlackMessengerGateway {
  async send(_webhookUrl: string, _message: SlackMessage): Promise<void> {
    throw new GatewayError('Failed to send slack message');
  }
}
