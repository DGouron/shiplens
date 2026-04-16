import { describe, expect, it } from 'vitest';
import { FailingCycleMetricsGateway } from '@/modules/analytics/testing/bad-path/failing.cycle-metrics.in-memory.gateway.ts';
import { StubCycleMetricsGateway } from '@/modules/analytics/testing/good-path/stub.cycle-metrics.in-memory.gateway.ts';
import { GetCycleMetricsUsecase } from '@/modules/analytics/usecases/get-cycle-metrics.usecase.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { CycleMetricsResponseBuilder } from '../../../builders/cycle-metrics-response.builder.ts';

describe('GetCycleMetricsUsecase', () => {
  it('delegates to the gateway with teamId and cycleId and returns the response', async () => {
    const response = new CycleMetricsResponseBuilder()
      .withThroughput(42)
      .build();
    const gateway = new StubCycleMetricsGateway({ response });
    const usecase = new GetCycleMetricsUsecase(gateway);

    const result = await usecase.execute({
      teamId: 'team-1',
      cycleId: 'cycle-7',
    });

    expect(result).toEqual(response);
    expect(gateway.calls).toEqual([{ teamId: 'team-1', cycleId: 'cycle-7' }]);
  });

  it('propagates GatewayError from the gateway', async () => {
    const usecase = new GetCycleMetricsUsecase(
      new FailingCycleMetricsGateway(),
    );

    await expect(
      usecase.execute({ teamId: 'team-1', cycleId: 'cycle-1' }),
    ).rejects.toBeInstanceOf(GatewayError);
  });
});
