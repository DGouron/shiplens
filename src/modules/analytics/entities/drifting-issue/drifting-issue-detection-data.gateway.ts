import { type DriftingIssueInput } from './drifting-issue.schema.js';

export abstract class DriftingIssueDetectionDataGateway {
  abstract getInProgressIssues(teamId: string): Promise<DriftingIssueInput[]>;
}
