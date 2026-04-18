import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';
import { type CycleAssigneeIssueDetail } from '../../entities/top-cycle-assignees/top-cycle-assignees.schema.js';

type CycleAssigneeIssuesInput =
  | { status: 'no_active_cycle' }
  | {
      status: 'ready';
      cycleId: string;
      cycleName: string;
      assigneeName: string;
      issues: CycleAssigneeIssueDetail[];
    };

export interface CycleAssigneeIssueRowDto {
  externalId: string;
  title: string;
  points: number | null;
  totalCycleTimeInHours: number | null;
  statusName: string;
}

export type CycleAssigneeIssuesDto =
  | { status: 'no_active_cycle' }
  | {
      status: 'ready';
      cycleId: string;
      assigneeName: string;
      issues: CycleAssigneeIssueRowDto[];
    };

@Injectable()
export class CycleAssigneeIssuesPresenter
  implements Presenter<CycleAssigneeIssuesInput, CycleAssigneeIssuesDto>
{
  present(input: CycleAssigneeIssuesInput): CycleAssigneeIssuesDto {
    if (input.status === 'no_active_cycle') {
      return { status: 'no_active_cycle' };
    }

    return {
      status: 'ready',
      cycleId: input.cycleId,
      assigneeName: input.assigneeName,
      issues: input.issues.map(toIssueRowDto),
    };
  }
}

function toIssueRowDto(
  issue: CycleAssigneeIssueDetail,
): CycleAssigneeIssueRowDto {
  return {
    externalId: issue.externalId,
    title: issue.title,
    points: issue.points,
    totalCycleTimeInHours: issue.totalCycleTimeInHours,
    statusName: issue.statusName,
  };
}
