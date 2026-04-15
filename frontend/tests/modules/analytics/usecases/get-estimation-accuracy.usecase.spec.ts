import { describe, expect, it } from 'vitest';
import { FailingEstimationAccuracyGateway } from '@/modules/analytics/testing/bad-path/failing.estimation-accuracy.in-memory.gateway.ts';
import { StubEstimationAccuracyGateway } from '@/modules/analytics/testing/good-path/stub.estimation-accuracy.in-memory.gateway.ts';
import { GetEstimationAccuracyUsecase } from '@/modules/analytics/usecases/get-estimation-accuracy.usecase.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { EstimationAccuracyResponseBuilder } from '../../../builders/estimation-accuracy-response.builder.ts';

describe('GetEstimationAccuracyUsecase', () => {
  it('delegates to the gateway with the team and cycle identifiers', async () => {
    const response = new EstimationAccuracyResponseBuilder()
      .withExcludedWithoutEstimation(3)
      .build();
    const gateway = new StubEstimationAccuracyGateway({ response });
    const usecase = new GetEstimationAccuracyUsecase(gateway);

    const result = await usecase.execute({
      teamId: 'team-1',
      cycleId: 'cycle-42',
    });

    expect(result.excludedWithoutEstimation).toBe(3);
    expect(gateway.calls).toEqual([{ teamId: 'team-1', cycleId: 'cycle-42' }]);
  });

  it('propagates GatewayError from the gateway', async () => {
    const usecase = new GetEstimationAccuracyUsecase(
      new FailingEstimationAccuracyGateway(),
    );

    await expect(
      usecase.execute({ teamId: 'team-1', cycleId: 'cycle-1' }),
    ).rejects.toBeInstanceOf(GatewayError);
  });
});
