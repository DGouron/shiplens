import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';
import { type ThemeIssueDetail } from '../../entities/cycle-theme-set/cycle-theme-set.schema.js';
import { type GetCycleIssuesForThemeResult } from '../../usecases/get-cycle-issues-for-theme.usecase.js';

export interface CycleThemeIssueRowDto {
  externalId: string;
  title: string;
  assigneeName: string | null;
  points: number | null;
  statusName: string;
  linearUrl: string | null;
}

export type CycleThemeIssuesDto =
  | { status: 'no_active_cycle' }
  | { status: 'theme_not_found' }
  | {
      status: 'ready';
      cycleId: string;
      cycleName: string;
      themeName: string;
      issues: CycleThemeIssueRowDto[];
    };

@Injectable()
export class CycleThemeIssuesPresenter
  implements Presenter<GetCycleIssuesForThemeResult, CycleThemeIssuesDto>
{
  present(input: GetCycleIssuesForThemeResult): CycleThemeIssuesDto {
    if (input.status === 'no_active_cycle') {
      return { status: 'no_active_cycle' };
    }
    if (input.status === 'theme_not_found') {
      return { status: 'theme_not_found' };
    }

    return {
      status: 'ready',
      cycleId: input.cycleId,
      cycleName: input.cycleName,
      themeName: input.themeName,
      issues: input.issues.map(toIssueRowDto),
    };
  }
}

function toIssueRowDto(issue: ThemeIssueDetail): CycleThemeIssueRowDto {
  return {
    externalId: issue.externalId,
    title: issue.title,
    assigneeName: issue.assigneeName,
    points: issue.points,
    statusName: issue.statusName,
    linearUrl: issue.linearUrl,
  };
}
