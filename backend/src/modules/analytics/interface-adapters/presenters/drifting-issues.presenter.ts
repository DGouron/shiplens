import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';
import { type DriftingIssue } from '../../entities/drifting-issue/drifting-issue.js';

export interface DriftingIssueDto {
  issueExternalId: string;
  issueTitle: string;
  teamId: string;
  statusName: string;
  points: number | null;
  driftStatus: string;
  elapsedBusinessHours: number;
  expectedMaxHours: number | null;
  issueUrl: string;
}

@Injectable()
export class DriftingIssuesPresenter
  implements Presenter<DriftingIssue[], DriftingIssueDto[]>
{
  present(issues: DriftingIssue[]): DriftingIssueDto[] {
    return issues.map((issue) => ({
      issueExternalId: issue.issueExternalId,
      issueTitle: issue.issueTitle,
      teamId: issue.teamId,
      statusName: issue.statusName,
      points: issue.points,
      driftStatus: issue.driftStatus,
      elapsedBusinessHours: issue.elapsedBusinessHours,
      expectedMaxHours: issue.expectedMaxHours,
      issueUrl: `https://linear.app/issue/${issue.issueUuid}`,
    }));
  }
}
