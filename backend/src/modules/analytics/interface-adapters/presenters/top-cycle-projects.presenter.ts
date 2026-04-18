import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';
import {
  type CycleProjectAggregate,
  NO_PROJECT_BUCKET_ID,
  NO_PROJECT_BUCKET_NAME,
} from '../../entities/top-cycle-projects/top-cycle-projects.schema.js';

type TopCycleProjectsInput =
  | { status: 'no_active_cycle' }
  | {
      status: 'ready';
      cycleId: string;
      cycleName: string;
      aggregates: CycleProjectAggregate[];
    };

export interface TopCycleProjectRowDto {
  projectId: string;
  projectName: string;
  isNoProjectBucket: boolean;
  issueCount: number;
  totalPoints: number;
  totalCycleTimeInHours: number | null;
}

export type TopCycleProjectsDto =
  | { status: 'no_active_cycle' }
  | {
      status: 'ready';
      cycleId: string;
      cycleName: string;
      projects: TopCycleProjectRowDto[];
    };

const MAX_PROJECTS_IN_TOP = 10;

@Injectable()
export class TopCycleProjectsPresenter
  implements Presenter<TopCycleProjectsInput, TopCycleProjectsDto>
{
  present(input: TopCycleProjectsInput): TopCycleProjectsDto {
    if (input.status === 'no_active_cycle') {
      return { status: 'no_active_cycle' };
    }

    const sorted = [...input.aggregates].sort((left, right) => {
      const countDifference = right.issueCount - left.issueCount;
      if (countDifference !== 0) {
        return countDifference;
      }
      return compareByProjectIdentity(left, right);
    });

    const topProjects = sorted.slice(0, MAX_PROJECTS_IN_TOP).map(toRowDto);

    return {
      status: 'ready',
      cycleId: input.cycleId,
      cycleName: input.cycleName,
      projects: topProjects,
    };
  }
}

function compareByProjectIdentity(
  left: CycleProjectAggregate,
  right: CycleProjectAggregate,
): number {
  const leftKey = left.projectExternalId ?? '';
  const rightKey = right.projectExternalId ?? '';
  return leftKey.localeCompare(rightKey);
}

function toRowDto(aggregate: CycleProjectAggregate): TopCycleProjectRowDto {
  if (aggregate.projectExternalId === null) {
    return {
      projectId: NO_PROJECT_BUCKET_ID,
      projectName: NO_PROJECT_BUCKET_NAME,
      isNoProjectBucket: true,
      issueCount: aggregate.issueCount,
      totalPoints: aggregate.totalPoints,
      totalCycleTimeInHours: aggregate.totalCycleTimeInHours,
    };
  }

  return {
    projectId: aggregate.projectExternalId,
    projectName: aggregate.projectName ?? NO_PROJECT_BUCKET_NAME,
    isNoProjectBucket: false,
    issueCount: aggregate.issueCount,
    totalPoints: aggregate.totalPoints,
    totalCycleTimeInHours: aggregate.totalCycleTimeInHours,
  };
}
