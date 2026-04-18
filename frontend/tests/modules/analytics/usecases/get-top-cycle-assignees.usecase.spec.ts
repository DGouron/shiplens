import { describe, expect, it } from 'vitest';
import { FailingTopCycleAssigneesGateway } from '@/modules/analytics/testing/bad-path/failing.top-cycle-assignees.in-memory.gateway.ts';
import { StubTopCycleAssigneesGateway } from '@/modules/analytics/testing/good-path/stub.top-cycle-assignees.in-memory.gateway.ts';
import { GetTopCycleAssigneesUsecase } from '@/modules/analytics/usecases/get-top-cycle-assignees.usecase.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';

describe('GetTopCycleAssigneesUsecase', () => {
  it('delegates to the gateway with the team id', async () => {
    const gateway = new StubTopCycleAssigneesGateway({
      ranking: { status: 'no_active_cycle' },
    });
    const usecase = new GetTopCycleAssigneesUsecase(gateway);

    const result = await usecase.execute({ teamId: 'team-1' });

    expect(result).toEqual({ status: 'no_active_cycle' });
    expect(gateway.topCallCount).toBe(1);
  });

  it('propagates GatewayError from the gateway', async () => {
    const usecase = new GetTopCycleAssigneesUsecase(
      new FailingTopCycleAssigneesGateway(),
    );

    await expect(usecase.execute({ teamId: 'team-1' })).rejects.toBeInstanceOf(
      GatewayError,
    );
  });
});
