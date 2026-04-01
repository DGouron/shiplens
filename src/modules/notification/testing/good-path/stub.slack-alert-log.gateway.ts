import { SlackAlertLogGateway } from '../../entities/team-alert-channel/slack-alert-log.gateway.js';

export class StubSlackAlertLogGateway extends SlackAlertLogGateway {
  private logs: Array<{ issueExternalId: string; sentAt: string }> = [];

  async wasAlertSentToday(
    issueExternalId: string,
    today: string,
  ): Promise<boolean> {
    return this.logs.some(
      (log) =>
        log.issueExternalId === issueExternalId &&
        log.sentAt.startsWith(today),
    );
  }

  async recordAlertSent(
    issueExternalId: string,
    sentAt: string,
  ): Promise<void> {
    this.logs.push({ issueExternalId, sentAt });
  }
}
