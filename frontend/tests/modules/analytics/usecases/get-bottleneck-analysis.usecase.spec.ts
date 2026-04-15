import { describe, expect, it } from 'vitest';
import { FailingBottleneckAnalysisGateway } from '@/modules/analytics/testing/bad-path/failing.bottleneck-analysis.in-memory.gateway.ts';
import { StubBottleneckAnalysisGateway } from '@/modules/analytics/testing/good-path/stub.bottleneck-analysis.in-memory.gateway.ts';
import { GetBottleneckAnalysisUsecase } from '@/modules/analytics/usecases/get-bottleneck-analysis.usecase.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { BottleneckAnalysisResponseBuilder } from '../../../builders/bottleneck-analysis-response.builder.ts';

describe('GetBottleneckAnalysisUsecase', () => {
  it('delegates to the gateway with teamId and cycleId and returns the response', async () => {
    const response = new BottleneckAnalysisResponseBuilder()
      .withBottleneckStatus('Code Review')
      .build();
    const gateway = new StubBottleneckAnalysisGateway({ response });
    const usecase = new GetBottleneckAnalysisUsecase(gateway);

    const result = await usecase.execute({
      teamId: 'team-1',
      cycleId: 'cycle-7',
    });

    expect(result).toEqual(response);
    expect(gateway.calls).toEqual([{ teamId: 'team-1', cycleId: 'cycle-7' }]);
  });

  it('propagates GatewayError from the gateway', async () => {
    const usecase = new GetBottleneckAnalysisUsecase(
      new FailingBottleneckAnalysisGateway(),
    );

    await expect(
      usecase.execute({ teamId: 'team-1', cycleId: 'cycle-1' }),
    ).rejects.toBeInstanceOf(GatewayError);
  });
});
