import { describe, expect, it } from 'vitest';
import { FailingSprintReportGateway } from '@/modules/analytics/testing/bad-path/failing.sprint-report.in-memory.gateway.ts';
import { StubSprintReportGateway } from '@/modules/analytics/testing/good-path/stub.sprint-report.in-memory.gateway.ts';
import { GenerateSprintReportUsecase } from '@/modules/analytics/usecases/generate-sprint-report.usecase.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';

describe('GenerateSprintReportUsecase', () => {
  it('delegates to the gateway with the cycle and team identifiers', async () => {
    const gateway = new StubSprintReportGateway();
    const usecase = new GenerateSprintReportUsecase(gateway);

    await usecase.execute({ cycleId: 'cycle-1', teamId: 'team-1' });

    expect(gateway.generateCalls).toEqual([
      { cycleId: 'cycle-1', teamId: 'team-1' },
    ]);
  });

  it('propagates GatewayError from the gateway', async () => {
    const usecase = new GenerateSprintReportUsecase(
      new FailingSprintReportGateway(),
    );

    await expect(
      usecase.execute({ cycleId: 'cycle-1', teamId: 'team-1' }),
    ).rejects.toBeInstanceOf(GatewayError);
  });
});
