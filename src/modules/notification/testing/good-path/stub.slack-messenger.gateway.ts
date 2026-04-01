import {
  SlackMessengerGateway,
  type SendReportParams,
} from '../../entities/slack-notification-config/slack-messenger.gateway.js';

export class StubSlackMessengerGateway extends SlackMessengerGateway {
  sentMessages: SendReportParams[] = [];
  testMessagesSent: string[] = [];

  async sendReport(params: SendReportParams): Promise<void> {
    this.sentMessages.push(params);
  }

  async sendTestMessage(webhookUrl: string): Promise<void> {
    this.testMessagesSent.push(webhookUrl);
  }
}
