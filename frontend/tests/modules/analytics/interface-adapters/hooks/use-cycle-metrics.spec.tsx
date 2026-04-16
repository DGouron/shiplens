import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { overrideUsecases, resetUsecases } from '@/main/dependencies.ts';
import { useCycleMetrics } from '@/modules/analytics/interface-adapters/hooks/use-cycle-metrics.ts';
import { FailingCycleMetricsGateway } from '@/modules/analytics/testing/bad-path/failing.cycle-metrics.in-memory.gateway.ts';
import { StubCycleMetricsGateway } from '@/modules/analytics/testing/good-path/stub.cycle-metrics.in-memory.gateway.ts';
import { GetCycleMetricsUsecase } from '@/modules/analytics/usecases/get-cycle-metrics.usecase.ts';
import { CycleMetricsResponseBuilder } from '../../../../builders/cycle-metrics-response.builder.ts';
import {
  createTestQueryClient,
  withQueryClient,
} from '../../../../helpers/query-client-wrapper.tsx';

function wrapper({ children }: { children: ReactNode }) {
  return withQueryClient(children, createTestQueryClient());
}

describe('useCycleMetrics', () => {
  afterEach(() => {
    resetUsecases();
  });

  it('exposes a loading state on first render when teamId and cycleId are provided', () => {
    overrideUsecases({
      getCycleMetrics: new GetCycleMetricsUsecase(
        new StubCycleMetricsGateway(),
      ),
    });

    const { result } = renderHook(
      () => useCycleMetrics({ teamId: 'team-1', cycleId: 'cycle-1' }),
      { wrapper },
    );

    expect(result.current.state.status).toBe('loading');
  });

  it('transitions to ready with the view model produced by the presenter', async () => {
    overrideUsecases({
      getCycleMetrics: new GetCycleMetricsUsecase(
        new StubCycleMetricsGateway({
          response: new CycleMetricsResponseBuilder()
            .withThroughput(42)
            .build(),
        }),
      ),
    });

    const { result } = renderHook(
      () => useCycleMetrics({ teamId: 'team-1', cycleId: 'cycle-1' }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });
    if (result.current.state.status === 'ready') {
      const throughputCard = result.current.state.data.cards.find(
        (card) => card.id === 'throughput',
      );
      expect(throughputCard?.value).toBe('42 issues');
    }
  });

  it('transitions to error when the gateway fails', async () => {
    overrideUsecases({
      getCycleMetrics: new GetCycleMetricsUsecase(
        new FailingCycleMetricsGateway(),
      ),
    });

    const { result } = renderHook(
      () => useCycleMetrics({ teamId: 'team-1', cycleId: 'cycle-1' }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('error');
    });
    if (result.current.state.status === 'error') {
      expect(result.current.state.message).toBe(
        'Failed to fetch cycle metrics',
      );
    }
  });

  it('stays loading and never fetches when teamId is null', () => {
    const gateway = new StubCycleMetricsGateway();
    overrideUsecases({
      getCycleMetrics: new GetCycleMetricsUsecase(gateway),
    });

    const { result } = renderHook(
      () => useCycleMetrics({ teamId: null, cycleId: 'cycle-1' }),
      { wrapper },
    );

    expect(result.current.state.status).toBe('loading');
    expect(gateway.calls).toEqual([]);
  });

  it('stays loading and never fetches when cycleId is null', () => {
    const gateway = new StubCycleMetricsGateway();
    overrideUsecases({
      getCycleMetrics: new GetCycleMetricsUsecase(gateway),
    });

    const { result } = renderHook(
      () => useCycleMetrics({ teamId: 'team-1', cycleId: null }),
      { wrapper },
    );

    expect(result.current.state.status).toBe('loading');
    expect(gateway.calls).toEqual([]);
  });
});
