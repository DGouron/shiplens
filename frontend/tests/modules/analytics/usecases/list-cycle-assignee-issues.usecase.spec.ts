import { describe, expect, it } from 'vitest';
import { FailingTopCycleAssigneesGateway } from '@/modules/analytics/testing/bad-path/failing.top-cycle-assignees.in-memory.gateway.ts';
import { StubTopCycleAssigneesGateway } from '@/modules/analytics/testing/good-path/stub.top-cycle-assignees.in-memory.gateway.ts';
import { ListCycleAssigneeIssuesUsecase } from '@/modules/analytics/usecases/list-cycle-assignee-issues.usecase.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';

describe('ListCycleAssigneeIssuesUsecase', () => {
  it('delegates to the gateway with the team id and assignee name', async () => {
    const gateway = new StubTopCycleAssigneesGateway({
      issuesByAssigneeName: {
        Alice: {
          status: 'ready',
          cycleId: 'cycle-1',
          assigneeName: 'Alice',
          issues: [],
        },
      },
    });
    const usecase = new ListCycleAssigneeIssuesUsecase(gateway);

    const result = await usecase.execute({
      teamId: 'team-1',
      assigneeName: 'Alice',
    });

    expect(result.status).toBe('ready');
    expect(gateway.issuesCallCount).toBe(1);
    expect(gateway.lastIssuesCall).toEqual({
      teamId: 'team-1',
      assigneeName: 'Alice',
    });
  });

  it('propagates GatewayError from the gateway', async () => {
    const usecase = new ListCycleAssigneeIssuesUsecase(
      new FailingTopCycleAssigneesGateway(),
    );

    await expect(
      usecase.execute({ teamId: 'team-1', assigneeName: 'Alice' }),
    ).rejects.toBeInstanceOf(GatewayError);
  });
});
