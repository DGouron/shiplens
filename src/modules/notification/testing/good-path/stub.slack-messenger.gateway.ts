import {
  SlackMessengerGateway,
  type SendReportParams,
  type SendAlertParams,
} from '../../entities/slack-notification-config/slack-messenger.gateway.js';

export class StubSlackMessengerGateway extends SlackMessengerGateway {
  sentMessages: SendReportParams[] = [];
  sentAlerts: SendAlertParams[] = [];
  testMessagesSent: string[] = [];

  async sendReport(params: SendReportParams): Promise<void> {
    this.sentMessages.push(params);
  }

  async sendAlert(params: SendAlertParams): Promise<void> {
    this.sentAlerts.push(params);
  }

  async sendTestMessage(webhookUrl: string): Promise<void> {
    this.testMessagesSent.push(webhookUrl);
  }
}
