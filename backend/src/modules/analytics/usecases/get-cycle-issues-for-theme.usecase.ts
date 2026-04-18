import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { type ThemeIssueDetail } from '../entities/cycle-theme-set/cycle-theme-set.schema.js';
import { CycleThemeSetCacheGateway } from '../entities/cycle-theme-set/cycle-theme-set-cache.gateway.js';
import { CycleThemeSetDataGateway } from '../entities/cycle-theme-set/cycle-theme-set-data.gateway.js';

interface GetCycleIssuesForThemeParams {
  teamId: string;
  themeName: string;
}

export type GetCycleIssuesForThemeResult =
  | { status: 'no_active_cycle' }
  | { status: 'theme_not_found' }
  | {
      status: 'ready';
      cycleId: string;
      cycleName: string;
      themeName: string;
      issues: ThemeIssueDetail[];
    };

@Injectable()
export class GetCycleIssuesForThemeUsecase
  implements Usecase<GetCycleIssuesForThemeParams, GetCycleIssuesForThemeResult>
{
  constructor(
    private readonly dataGateway: CycleThemeSetDataGateway,
    private readonly cacheGateway: CycleThemeSetCacheGateway,
  ) {}

  async execute(
    params: GetCycleIssuesForThemeParams,
  ): Promise<GetCycleIssuesForThemeResult> {
    const locator = await this.dataGateway.getActiveCycleLocator(params.teamId);

    if (locator === null) {
      return { status: 'no_active_cycle' };
    }

    const cached = await this.cacheGateway.get(locator.cycleId);

    if (cached === null) {
      return { status: 'theme_not_found' };
    }

    const theme = cached.themes.find(
      (candidate) => candidate.name === params.themeName,
    );

    if (theme === undefined) {
      return { status: 'theme_not_found' };
    }

    const candidateIssues =
      await this.dataGateway.getCycleIssuesForThemeDetection(
        params.teamId,
        locator.cycleId,
      );

    const issueByExternalId = new Map(
      candidateIssues.map((issue) => [issue.externalId, issue]),
    );

    const issues: ThemeIssueDetail[] = [];
    for (const externalId of theme.issueExternalIds) {
      const issue = issueByExternalId.get(externalId);
      if (issue === undefined) {
        continue;
      }
      issues.push({
        externalId: issue.externalId,
        title: issue.title,
        assigneeName: issue.assigneeName,
        points: issue.points,
        statusName: issue.statusName,
        linearUrl: issue.linearUrl,
      });
    }

    return {
      status: 'ready',
      cycleId: locator.cycleId,
      cycleName: locator.cycleName,
      themeName: params.themeName,
      issues,
    };
  }
}
