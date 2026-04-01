export interface BlockedIssueForAlert {
  issueExternalId: string;
  issueTitle: string;
  issueUuid: string;
  statusName: string;
  severity: string;
  durationHours: number;
  assigneeName: string | null;
  teamId: string;
}

export abstract class BlockedIssueAlertDataGateway {
  abstract findActiveWithContext(): Promise<BlockedIssueForAlert[]>;
}
