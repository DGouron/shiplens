import { describe, expect, it } from 'vitest';
import { FailingTopCycleThemesGateway } from '@/modules/analytics/testing/bad-path/failing.top-cycle-themes.in-memory.gateway.ts';
import { StubTopCycleThemesGateway } from '@/modules/analytics/testing/good-path/stub.top-cycle-themes.in-memory.gateway.ts';
import { ListCycleThemeIssuesUsecase } from '@/modules/analytics/usecases/list-cycle-theme-issues.usecase.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';

describe('ListCycleThemeIssuesUsecase', () => {
  it('delegates to the gateway with the team id and theme name', async () => {
    const gateway = new StubTopCycleThemesGateway({
      issuesByThemeName: {
        'Auth refactor': {
          status: 'ready',
          cycleId: 'cycle-1',
          cycleName: 'Cycle 1',
          themeName: 'Auth refactor',
          issues: [],
        },
      },
    });
    const usecase = new ListCycleThemeIssuesUsecase(gateway);

    const result = await usecase.execute({
      teamId: 'team-1',
      themeName: 'Auth refactor',
    });

    expect(result.status).toBe('ready');
    expect(gateway.issuesCallCount).toBe(1);
    expect(gateway.lastIssuesCall).toEqual({
      teamId: 'team-1',
      themeName: 'Auth refactor',
    });
  });

  it('propagates GatewayError from the gateway', async () => {
    const usecase = new ListCycleThemeIssuesUsecase(
      new FailingTopCycleThemesGateway(),
    );

    await expect(
      usecase.execute({ teamId: 'team-1', themeName: 'Auth' }),
    ).rejects.toBeInstanceOf(GatewayError);
  });
});
