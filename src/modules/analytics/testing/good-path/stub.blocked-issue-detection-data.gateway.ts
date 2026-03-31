import { BlockedIssueDetectionDataGateway, type IssueWithCurrentStatus } from '../../entities/blocked-issue-alert/blocked-issue-detection-data.gateway.js';

export class StubBlockedIssueDetectionDataGateway extends BlockedIssueDetectionDataGateway {
  hasSyncData = true;
  issuesWithCurrentStatus: IssueWithCurrentStatus[] = [];

  async hasSynchronizedData(): Promise<boolean> {
    return this.hasSyncData;
  }

  async getIssuesWithCurrentStatus(): Promise<IssueWithCurrentStatus[]> {
    return this.issuesWithCurrentStatus;
  }
}
