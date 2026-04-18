import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';
import { type CycleAssigneeAggregate } from '../../entities/top-cycle-assignees/top-cycle-assignees.schema.js';

type TopCycleAssigneesInput =
  | { status: 'no_active_cycle' }
  | {
      status: 'ready';
      cycleId: string;
      cycleName: string;
      aggregates: CycleAssigneeAggregate[];
    };

export interface TopCycleAssigneeRowDto {
  assigneeName: string;
  issueCount: number;
  totalPoints: number;
  totalCycleTimeInHours: number | null;
}

export type TopCycleAssigneesDto =
  | { status: 'no_active_cycle' }
  | {
      status: 'ready';
      cycleId: string;
      cycleName: string;
      assignees: TopCycleAssigneeRowDto[];
    };

const MAX_ASSIGNEES_IN_TOP = 5;

@Injectable()
export class TopCycleAssigneesPresenter
  implements Presenter<TopCycleAssigneesInput, TopCycleAssigneesDto>
{
  present(input: TopCycleAssigneesInput): TopCycleAssigneesDto {
    if (input.status === 'no_active_cycle') {
      return { status: 'no_active_cycle' };
    }

    const sorted = [...input.aggregates].sort((left, right) => {
      const countDifference = right.issueCount - left.issueCount;
      if (countDifference !== 0) {
        return countDifference;
      }
      return left.assigneeName.localeCompare(right.assigneeName);
    });

    const topAssignees = sorted.slice(0, MAX_ASSIGNEES_IN_TOP).map(toRowDto);

    return {
      status: 'ready',
      cycleId: input.cycleId,
      cycleName: input.cycleName,
      assignees: topAssignees,
    };
  }
}

function toRowDto(aggregate: CycleAssigneeAggregate): TopCycleAssigneeRowDto {
  return {
    assigneeName: aggregate.assigneeName,
    issueCount: aggregate.issueCount,
    totalPoints: aggregate.totalPoints,
    totalCycleTimeInHours: aggregate.totalCycleTimeInHours,
  };
}
