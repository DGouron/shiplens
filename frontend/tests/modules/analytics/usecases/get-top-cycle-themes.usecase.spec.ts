import { describe, expect, it } from 'vitest';
import { FailingTopCycleThemesGateway } from '@/modules/analytics/testing/bad-path/failing.top-cycle-themes.in-memory.gateway.ts';
import { StubTopCycleThemesGateway } from '@/modules/analytics/testing/good-path/stub.top-cycle-themes.in-memory.gateway.ts';
import { GetTopCycleThemesUsecase } from '@/modules/analytics/usecases/get-top-cycle-themes.usecase.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';

describe('GetTopCycleThemesUsecase', () => {
  it('delegates to the gateway with the team id and forceRefresh flag', async () => {
    const gateway = new StubTopCycleThemesGateway({
      themes: { status: 'no_active_cycle' },
    });
    const usecase = new GetTopCycleThemesUsecase(gateway);

    const result = await usecase.execute({
      teamId: 'team-1',
      forceRefresh: false,
    });

    expect(result).toEqual({ status: 'no_active_cycle' });
    expect(gateway.topCallCount).toBe(1);
    expect(gateway.lastForceRefresh).toBe(false);
  });

  it('forwards forceRefresh=true to the gateway', async () => {
    const gateway = new StubTopCycleThemesGateway({
      themes: { status: 'no_active_cycle' },
    });
    const usecase = new GetTopCycleThemesUsecase(gateway);

    await usecase.execute({ teamId: 'team-1', forceRefresh: true });

    expect(gateway.lastForceRefresh).toBe(true);
  });

  it('forwards an optional provider to the gateway', async () => {
    const gateway = new StubTopCycleThemesGateway({
      themes: { status: 'no_active_cycle' },
    });
    const usecase = new GetTopCycleThemesUsecase(gateway);

    await usecase.execute({
      teamId: 'team-1',
      forceRefresh: false,
      provider: 'OpenAI',
    });

    expect(gateway.lastProvider).toBe('OpenAI');
  });

  it('propagates GatewayError from the gateway', async () => {
    const usecase = new GetTopCycleThemesUsecase(
      new FailingTopCycleThemesGateway(),
    );

    await expect(
      usecase.execute({ teamId: 'team-1', forceRefresh: false }),
    ).rejects.toBeInstanceOf(GatewayError);
  });
});
