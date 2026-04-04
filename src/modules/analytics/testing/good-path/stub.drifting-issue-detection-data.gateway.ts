import { type DriftingIssueInput } from '../../entities/drifting-issue/drifting-issue.schema.js';
import { DriftingIssueDetectionDataGateway } from '../../entities/drifting-issue/drifting-issue-detection-data.gateway.js';

export class StubDriftingIssueDetectionDataGateway extends DriftingIssueDetectionDataGateway {
  issues: Map<string, DriftingIssueInput[]> = new Map();

  async getInProgressIssues(teamId: string): Promise<DriftingIssueInput[]> {
    return this.issues.get(teamId) ?? [];
  }
}
