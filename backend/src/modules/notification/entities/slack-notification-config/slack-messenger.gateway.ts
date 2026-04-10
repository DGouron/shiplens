export interface SendReportParams {
  webhookUrl: string;
  reportSummary: string;
  reportLink: string;
  cycleName: string;
}

export interface SendAlertParams {
  webhookUrl: string;
  issueTitle: string;
  statusName: string;
  durationHours: number;
  assigneeName: string | null;
  issueUrl: string;
  severity: string;
}

export abstract class SlackMessengerGateway {
  abstract sendReport(params: SendReportParams): Promise<void>;
  abstract sendAlert(params: SendAlertParams): Promise<void>;
  abstract sendTestMessage(webhookUrl: string): Promise<void>;
}
