export interface SendReportParams {
  webhookUrl: string;
  reportSummary: string;
  reportLink: string;
  cycleName: string;
}

export abstract class SlackMessengerGateway {
  abstract sendReport(params: SendReportParams): Promise<void>;
  abstract sendTestMessage(webhookUrl: string): Promise<void>;
}
