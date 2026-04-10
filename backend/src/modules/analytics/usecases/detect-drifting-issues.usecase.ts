import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { DriftingIssue } from '../entities/drifting-issue/drifting-issue.js';
import { DriftingIssueDetectionDataGateway } from '../entities/drifting-issue/drifting-issue-detection-data.gateway.js';
import { TeamSettingsGateway } from '../entities/team-settings/team-settings.gateway.js';

interface DetectDriftingIssuesParams {
  teamId: string;
}

@Injectable()
export class DetectDriftingIssuesUsecase
  implements Usecase<DetectDriftingIssuesParams, DriftingIssue[]>
{
  constructor(
    private readonly detectionDataGateway: DriftingIssueDetectionDataGateway,
    private readonly teamSettingsGateway: TeamSettingsGateway,
  ) {}

  async execute(params: DetectDriftingIssuesParams): Promise<DriftingIssue[]> {
    const timezone = await this.teamSettingsGateway.getTimezone(params.teamId);
    const issues = await this.detectionDataGateway.getInProgressIssues(
      params.teamId,
    );
    const now = new Date().toISOString();

    const results: DriftingIssue[] = [];

    for (const issue of issues) {
      const analyzed = DriftingIssue.analyze(issue, now, timezone);
      if (analyzed?.isAlert) {
        results.push(analyzed);
      }
    }

    return results;
  }
}
