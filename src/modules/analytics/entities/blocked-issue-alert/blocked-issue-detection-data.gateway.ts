export interface IssueWithCurrentStatus {
  issueExternalId: string;
  issueTitle: string;
  issueUuid: string;
  statusName: string;
  statusEnteredAt: string;
  teamId: string;
}

export abstract class BlockedIssueDetectionDataGateway {
  abstract hasSynchronizedData(): Promise<boolean>;
  abstract getIssuesWithCurrentStatus(): Promise<IssueWithCurrentStatus[]>;
}
