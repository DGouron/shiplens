import { describe, expect, it } from 'vitest';
import { FailingTopCycleProjectsGateway } from '@/modules/analytics/testing/bad-path/failing.top-cycle-projects.in-memory.gateway.ts';
import { StubTopCycleProjectsGateway } from '@/modules/analytics/testing/good-path/stub.top-cycle-projects.in-memory.gateway.ts';
import { ListCycleProjectIssuesUsecase } from '@/modules/analytics/usecases/list-cycle-project-issues.usecase.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';

describe('ListCycleProjectIssuesUsecase', () => {
  it('delegates to the gateway with the team and project ids', async () => {
    const gateway = new StubTopCycleProjectsGateway({
      issuesByProjectId: {
        'proj-a': {
          status: 'ready',
          cycleId: 'cycle-1',
          projectId: 'proj-a',
          projectName: 'Alpha',
          isNoProjectBucket: false,
          issues: [],
        },
      },
    });
    const usecase = new ListCycleProjectIssuesUsecase(gateway);

    const result = await usecase.execute({
      teamId: 'team-1',
      projectId: 'proj-a',
    });

    expect(result.status).toBe('ready');
    expect(gateway.issuesCallCount).toBe(1);
  });

  it('propagates GatewayError from the gateway', async () => {
    const usecase = new ListCycleProjectIssuesUsecase(
      new FailingTopCycleProjectsGateway(),
    );

    await expect(
      usecase.execute({ teamId: 'team-1', projectId: 'proj-a' }),
    ).rejects.toBeInstanceOf(GatewayError);
  });
});
