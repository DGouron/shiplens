import { SlackMessengerGateway, type SlackMessage } from '../../entities/slack-notification-config/slack-messenger.gateway.js';

export class StubSlackMessengerGateway extends SlackMessengerGateway {
  sentMessages: Array<{ webhookUrl: string; message: SlackMessage }> = [];

  async send(webhookUrl: string, message: SlackMessage): Promise<void> {
    this.sentMessages.push({ webhookUrl, message });
  }
}
