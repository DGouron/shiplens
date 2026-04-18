import { describe, expect, it } from 'vitest';
import { FailingTopCycleProjectsGateway } from '@/modules/analytics/testing/bad-path/failing.top-cycle-projects.in-memory.gateway.ts';
import { StubTopCycleProjectsGateway } from '@/modules/analytics/testing/good-path/stub.top-cycle-projects.in-memory.gateway.ts';
import { GetTopCycleProjectsUsecase } from '@/modules/analytics/usecases/get-top-cycle-projects.usecase.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';

describe('GetTopCycleProjectsUsecase', () => {
  it('delegates to the gateway with the team id', async () => {
    const gateway = new StubTopCycleProjectsGateway({
      ranking: { status: 'no_active_cycle' },
    });
    const usecase = new GetTopCycleProjectsUsecase(gateway);

    const result = await usecase.execute({ teamId: 'team-1' });

    expect(result).toEqual({ status: 'no_active_cycle' });
    expect(gateway.topCallCount).toBe(1);
  });

  it('propagates GatewayError from the gateway', async () => {
    const usecase = new GetTopCycleProjectsUsecase(
      new FailingTopCycleProjectsGateway(),
    );

    await expect(usecase.execute({ teamId: 'team-1' })).rejects.toBeInstanceOf(
      GatewayError,
    );
  });
});
