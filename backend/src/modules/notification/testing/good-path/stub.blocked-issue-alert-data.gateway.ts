import {
  BlockedIssueAlertDataGateway,
  type BlockedIssueForAlert,
} from '../../entities/team-alert-channel/blocked-issue-alert-data.gateway.js';

export class StubBlockedIssueAlertDataGateway extends BlockedIssueAlertDataGateway {
  issues: BlockedIssueForAlert[] = [];

  async findActiveWithContext(): Promise<BlockedIssueForAlert[]> {
    return this.issues;
  }
}
