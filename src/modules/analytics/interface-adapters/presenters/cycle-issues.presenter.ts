import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';
import { type CycleIssueDetail } from '../../entities/cycle-report-page/cycle-report-page.schema.js';

interface CycleIssuesInput {
  issues: CycleIssueDetail[];
}

export interface CycleIssueDto {
  externalId: string;
  title: string;
  statusName: string;
  points: string;
  assigneeName: string;
}

export interface CycleIssuesDto {
  issues: CycleIssueDto[];
}

@Injectable()
export class CycleIssuesPresenter
  implements Presenter<CycleIssuesInput, CycleIssuesDto>
{
  present(input: CycleIssuesInput): CycleIssuesDto {
    return {
      issues: input.issues.map((issue) => ({
        externalId: issue.externalId,
        title: issue.title,
        statusName: issue.statusName,
        points: issue.points !== null ? `${issue.points} pts` : '-',
        assigneeName: issue.assigneeName ?? 'Non assigné',
      })),
    };
  }
}
