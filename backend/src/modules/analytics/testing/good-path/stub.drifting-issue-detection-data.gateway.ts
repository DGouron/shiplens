import { type CompletedIssueDrift } from '../../entities/drifting-issue/completed-issue-drift.schema.js';
import { type DriftingIssueInput } from '../../entities/drifting-issue/drifting-issue.schema.js';
import { DriftingIssueDetectionDataGateway } from '../../entities/drifting-issue/drifting-issue-detection-data.gateway.js';

export class StubDriftingIssueDetectionDataGateway extends DriftingIssueDetectionDataGateway {
  issues: Map<string, DriftingIssueInput[]> = new Map();
  completedCycleDriftData: CompletedIssueDrift[] = [];

  async getInProgressIssues(teamId: string): Promise<DriftingIssueInput[]> {
    return this.issues.get(teamId) ?? [];
  }

  async getCompletedCycleDriftData(
    _teamId: string,
    _cycleId: string,
  ): Promise<CompletedIssueDrift[]> {
    return this.completedCycleDriftData;
  }
}
