import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';
import { type DetectCycleThemesResult } from '../../usecases/detect-cycle-themes.usecase.js';

export interface CycleThemeRowDto {
  name: string;
  issueCount: number;
  totalPoints: number;
  totalCycleTimeInHours: number | null;
}

export type CycleThemesDto =
  | { status: 'no_active_cycle' }
  | { status: 'below_threshold'; issueCount: number }
  | { status: 'ai_unavailable' }
  | {
      status: 'ready';
      cycleId: string;
      cycleName: string;
      language: 'EN' | 'FR';
      themes: CycleThemeRowDto[];
      fromCache: boolean;
    };

@Injectable()
export class CycleThemesPresenter
  implements Presenter<DetectCycleThemesResult, CycleThemesDto>
{
  present(input: DetectCycleThemesResult): CycleThemesDto {
    if (input.status === 'no_active_cycle') {
      return { status: 'no_active_cycle' };
    }
    if (input.status === 'below_threshold') {
      return { status: 'below_threshold', issueCount: input.issueCount };
    }
    if (input.status === 'ai_unavailable') {
      return { status: 'ai_unavailable' };
    }

    const sorted = [...input.themes].sort((left, right) => {
      const countDifference = right.issueCount - left.issueCount;
      if (countDifference !== 0) {
        return countDifference;
      }
      return left.name.localeCompare(right.name);
    });

    return {
      status: 'ready',
      cycleId: input.cycleId,
      cycleName: input.cycleName,
      language: input.language,
      themes: sorted.map((aggregate) => ({
        name: aggregate.name,
        issueCount: aggregate.issueCount,
        totalPoints: aggregate.totalPoints,
        totalCycleTimeInHours: aggregate.totalCycleTimeInHours,
      })),
      fromCache: input.fromCache,
    };
  }
}
