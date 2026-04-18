import { StubCycleThemeSetCacheGateway } from '@modules/analytics/testing/good-path/stub.cycle-theme-set-cache.gateway.js';
import { StubCycleThemeSetDataGateway } from '@modules/analytics/testing/good-path/stub.cycle-theme-set-data.gateway.js';
import { GetCycleIssuesForThemeUsecase } from '@modules/analytics/usecases/get-cycle-issues-for-theme.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { CycleThemeSetBuilder } from '../../../builders/cycle-theme-set.builder.js';

describe('GetCycleIssuesForThemeUsecase', () => {
  let dataGateway: StubCycleThemeSetDataGateway;
  let cacheGateway: StubCycleThemeSetCacheGateway;
  let usecase: GetCycleIssuesForThemeUsecase;

  beforeEach(() => {
    dataGateway = new StubCycleThemeSetDataGateway();
    cacheGateway = new StubCycleThemeSetCacheGateway();
    usecase = new GetCycleIssuesForThemeUsecase(dataGateway, cacheGateway);
  });

  it('returns no_active_cycle when team has no active cycle', async () => {
    const result = await usecase.execute({
      teamId: 'team-1',
      themeName: 'Auth',
    });

    expect(result).toEqual({ status: 'no_active_cycle' });
  });

  it('returns theme_not_found when cached themes do not contain the requested name', async () => {
    dataGateway.setActiveCycle('team-1', {
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
    });
    const cached = new CycleThemeSetBuilder()
      .withCycleId('cycle-1')
      .withTeamId('team-1')
      .withThemes([{ name: 'Other theme', issueExternalIds: ['issue-1'] }])
      .build();
    cacheGateway.seed(cached);

    const result = await usecase.execute({
      teamId: 'team-1',
      themeName: 'Missing theme',
    });

    expect(result).toEqual({ status: 'theme_not_found' });
  });

  it('returns theme_not_found when no cache entry exists for the active cycle', async () => {
    dataGateway.setActiveCycle('team-1', {
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
    });

    const result = await usecase.execute({
      teamId: 'team-1',
      themeName: 'Auth',
    });

    expect(result).toEqual({ status: 'theme_not_found' });
  });

  it('returns ready with the issues matching the theme name', async () => {
    dataGateway.setActiveCycle('team-1', {
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
    });
    dataGateway.setThemeCandidateIssues('cycle-1', [
      {
        externalId: 'issue-1',
        title: 'Fix login',
        labels: ['auth'],
        points: 3,
        statusName: 'Done',
        assigneeName: 'Alice',
        totalCycleTimeInHours: 4,
        linearUrl: 'https://linear.app/issue-1',
      },
      {
        externalId: 'issue-2',
        title: 'Ignored',
        labels: [],
        points: 1,
        statusName: 'Done',
        assigneeName: null,
        totalCycleTimeInHours: null,
        linearUrl: null,
      },
    ]);
    const cached = new CycleThemeSetBuilder()
      .withCycleId('cycle-1')
      .withTeamId('team-1')
      .withThemes([{ name: 'Auth', issueExternalIds: ['issue-1'] }])
      .build();
    cacheGateway.seed(cached);

    const result = await usecase.execute({
      teamId: 'team-1',
      themeName: 'Auth',
    });

    if (result.status !== 'ready') {
      throw new Error('expected ready status');
    }
    expect(result.cycleId).toBe('cycle-1');
    expect(result.themeName).toBe('Auth');
    expect(result.issues).toEqual([
      {
        externalId: 'issue-1',
        title: 'Fix login',
        assigneeName: 'Alice',
        points: 3,
        statusName: 'Done',
        linearUrl: 'https://linear.app/issue-1',
      },
    ]);
  });
});
