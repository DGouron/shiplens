import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { overrideUsecases, resetUsecases } from '@/main/dependencies.ts';
import { useEstimationAccuracy } from '@/modules/analytics/interface-adapters/hooks/use-estimation-accuracy.ts';
import { FailingEstimationAccuracyGateway } from '@/modules/analytics/testing/bad-path/failing.estimation-accuracy.in-memory.gateway.ts';
import { StubEstimationAccuracyGateway } from '@/modules/analytics/testing/good-path/stub.estimation-accuracy.in-memory.gateway.ts';
import { GetEstimationAccuracyUsecase } from '@/modules/analytics/usecases/get-estimation-accuracy.usecase.ts';
import { EstimationAccuracyResponseBuilder } from '../../../../builders/estimation-accuracy-response.builder.ts';
import {
  createTestQueryClient,
  withQueryClient,
} from '../../../../helpers/query-client-wrapper.tsx';

function wrapper({ children }: { children: ReactNode }) {
  return withQueryClient(children, createTestQueryClient());
}

describe('useEstimationAccuracy', () => {
  afterEach(() => {
    resetUsecases();
  });

  it('exposes a loading state on first render when teamId and cycleId are provided', () => {
    overrideUsecases({
      getEstimationAccuracy: new GetEstimationAccuracyUsecase(
        new StubEstimationAccuracyGateway(),
      ),
    });

    const { result } = renderHook(
      () => useEstimationAccuracy({ teamId: 'team-1', cycleId: 'cycle-1' }),
      { wrapper },
    );

    expect(result.current.state.status).toBe('loading');
  });

  it('transitions to ready with a view model when the gateway resolves', async () => {
    overrideUsecases({
      getEstimationAccuracy: new GetEstimationAccuracyUsecase(
        new StubEstimationAccuracyGateway({
          response: new EstimationAccuracyResponseBuilder()
            .withIssues([
              { classification: 'well-estimated' },
              { classification: 'over-estimated' },
            ])
            .build(),
        }),
      ),
    });

    const { result } = renderHook(
      () => useEstimationAccuracy({ teamId: 'team-1', cycleId: 'cycle-1' }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });
    if (result.current.state.status === 'ready') {
      expect(result.current.state.data.donut.wellEstimated.count).toBe(1);
      expect(result.current.state.data.donut.overEstimated.count).toBe(1);
    }
  });

  it('transitions to error when the gateway fails', async () => {
    overrideUsecases({
      getEstimationAccuracy: new GetEstimationAccuracyUsecase(
        new FailingEstimationAccuracyGateway(),
      ),
    });

    const { result } = renderHook(
      () => useEstimationAccuracy({ teamId: 'team-1', cycleId: 'cycle-1' }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('error');
    });
    if (result.current.state.status === 'error') {
      expect(result.current.state.message).toBe(
        'Failed to fetch estimation accuracy',
      );
    }
  });

  it('stays loading and never fetches when teamId is null', () => {
    const gateway = new StubEstimationAccuracyGateway();
    overrideUsecases({
      getEstimationAccuracy: new GetEstimationAccuracyUsecase(gateway),
    });

    const { result } = renderHook(
      () => useEstimationAccuracy({ teamId: null, cycleId: 'cycle-1' }),
      { wrapper },
    );

    expect(result.current.state.status).toBe('loading');
    expect(gateway.calls).toEqual([]);
  });

  it('stays loading and never fetches when cycleId is null', () => {
    const gateway = new StubEstimationAccuracyGateway();
    overrideUsecases({
      getEstimationAccuracy: new GetEstimationAccuracyUsecase(gateway),
    });

    const { result } = renderHook(
      () => useEstimationAccuracy({ teamId: 'team-1', cycleId: null }),
      { wrapper },
    );

    expect(result.current.state.status).toBe('loading');
    expect(gateway.calls).toEqual([]);
  });
});
