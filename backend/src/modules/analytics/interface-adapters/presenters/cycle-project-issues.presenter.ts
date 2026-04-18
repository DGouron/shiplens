import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';
import {
  type CycleProjectIssueDetail,
  NO_PROJECT_BUCKET_ID,
  NO_PROJECT_BUCKET_NAME,
} from '../../entities/top-cycle-projects/top-cycle-projects.schema.js';

type CycleProjectIssuesInput =
  | { status: 'no_active_cycle' }
  | {
      status: 'ready';
      cycleId: string;
      cycleName: string;
      projectExternalId: string | null;
      projectName: string | null;
      issues: CycleProjectIssueDetail[];
    };

export interface CycleProjectIssueRowDto {
  externalId: string;
  title: string;
  assigneeName: string | null;
  points: number | null;
  statusName: string;
}

export type CycleProjectIssuesDto =
  | { status: 'no_active_cycle' }
  | {
      status: 'ready';
      cycleId: string;
      projectId: string;
      projectName: string;
      isNoProjectBucket: boolean;
      issues: CycleProjectIssueRowDto[];
    };

@Injectable()
export class CycleProjectIssuesPresenter
  implements Presenter<CycleProjectIssuesInput, CycleProjectIssuesDto>
{
  present(input: CycleProjectIssuesInput): CycleProjectIssuesDto {
    if (input.status === 'no_active_cycle') {
      return { status: 'no_active_cycle' };
    }

    if (input.projectExternalId === null) {
      return {
        status: 'ready',
        cycleId: input.cycleId,
        projectId: NO_PROJECT_BUCKET_ID,
        projectName: NO_PROJECT_BUCKET_NAME,
        isNoProjectBucket: true,
        issues: input.issues.map(toIssueRowDto),
      };
    }

    return {
      status: 'ready',
      cycleId: input.cycleId,
      projectId: input.projectExternalId,
      projectName: input.projectName ?? NO_PROJECT_BUCKET_NAME,
      isNoProjectBucket: false,
      issues: input.issues.map(toIssueRowDto),
    };
  }
}

function toIssueRowDto(
  issue: CycleProjectIssueDetail,
): CycleProjectIssueRowDto {
  return {
    externalId: issue.externalId,
    title: issue.title,
    assigneeName: issue.assigneeName,
    points: issue.points,
    statusName: issue.statusName,
  };
}
