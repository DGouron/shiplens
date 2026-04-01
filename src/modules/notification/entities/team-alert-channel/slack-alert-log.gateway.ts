export abstract class SlackAlertLogGateway {
  abstract wasAlertSentToday(
    issueExternalId: string,
    today: string,
  ): Promise<boolean>;
  abstract recordAlertSent(
    issueExternalId: string,
    sentAt: string,
  ): Promise<void>;
}
