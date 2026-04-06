import { type CompletedIssueDrift } from './completed-issue-drift.schema.js';
import { type DriftingIssueInput } from './drifting-issue.schema.js';

export abstract class DriftingIssueDetectionDataGateway {
  abstract getInProgressIssues(teamId: string): Promise<DriftingIssueInput[]>;
  abstract getCompletedCycleDriftData(
    teamId: string,
    cycleId: string,
  ): Promise<CompletedIssueDrift[]>;
}
