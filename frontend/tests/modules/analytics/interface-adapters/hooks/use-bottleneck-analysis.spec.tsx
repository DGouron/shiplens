import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { overrideUsecases, resetUsecases } from '@/main/dependencies.ts';
import { useBottleneckAnalysis } from '@/modules/analytics/interface-adapters/hooks/use-bottleneck-analysis.ts';
import { FailingBottleneckAnalysisGateway } from '@/modules/analytics/testing/bad-path/failing.bottleneck-analysis.in-memory.gateway.ts';
import { StubBottleneckAnalysisGateway } from '@/modules/analytics/testing/good-path/stub.bottleneck-analysis.in-memory.gateway.ts';
import { GetBottleneckAnalysisUsecase } from '@/modules/analytics/usecases/get-bottleneck-analysis.usecase.ts';
import { BottleneckAnalysisResponseBuilder } from '../../../../builders/bottleneck-analysis-response.builder.ts';
import {
  createTestQueryClient,
  withQueryClient,
} from '../../../../helpers/query-client-wrapper.tsx';

function wrapper({ children }: { children: ReactNode }) {
  return withQueryClient(children, createTestQueryClient());
}

describe('useBottleneckAnalysis', () => {
  afterEach(() => {
    resetUsecases();
  });

  it('exposes a loading state on first render when teamId and cycleId are provided', () => {
    overrideUsecases({
      getBottleneckAnalysis: new GetBottleneckAnalysisUsecase(
        new StubBottleneckAnalysisGateway(),
      ),
    });

    const { result } = renderHook(
      () =>
        useBottleneckAnalysis({
          teamId: 'team-1',
          cycleId: 'cycle-1',
          selectedMemberName: null,
        }),
      { wrapper },
    );

    expect(result.current.state.status).toBe('loading');
  });

  it('transitions to ready with the view model produced by the presenter', async () => {
    overrideUsecases({
      getBottleneckAnalysis: new GetBottleneckAnalysisUsecase(
        new StubBottleneckAnalysisGateway({
          response: new BottleneckAnalysisResponseBuilder()
            .withStatusDistribution([
              { statusName: 'In Progress', medianHours: 12 },
              { statusName: 'In Review', medianHours: 48 },
            ])
            .withBottleneckStatus('In Review')
            .build(),
        }),
      ),
    });

    const { result } = renderHook(
      () =>
        useBottleneckAnalysis({
          teamId: 'team-1',
          cycleId: 'cycle-1',
          selectedMemberName: null,
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });
    if (result.current.state.status === 'ready') {
      expect(result.current.state.data.rows[0]?.statusName).toBe('In Review');
      expect(result.current.state.data.rows[0]?.isBottleneck).toBe(true);
    }
  });

  it('transitions to error when the gateway fails', async () => {
    overrideUsecases({
      getBottleneckAnalysis: new GetBottleneckAnalysisUsecase(
        new FailingBottleneckAnalysisGateway(),
      ),
    });

    const { result } = renderHook(
      () =>
        useBottleneckAnalysis({
          teamId: 'team-1',
          cycleId: 'cycle-1',
          selectedMemberName: null,
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('error');
    });
    if (result.current.state.status === 'error') {
      expect(result.current.state.message).toBe(
        'Failed to fetch bottleneck analysis',
      );
    }
  });

  it('stays loading and never fetches when teamId is null', () => {
    const gateway = new StubBottleneckAnalysisGateway();
    overrideUsecases({
      getBottleneckAnalysis: new GetBottleneckAnalysisUsecase(gateway),
    });

    const { result } = renderHook(
      () =>
        useBottleneckAnalysis({
          teamId: null,
          cycleId: 'cycle-1',
          selectedMemberName: null,
        }),
      { wrapper },
    );

    expect(result.current.state.status).toBe('loading');
    expect(gateway.calls).toEqual([]);
  });

  it('stays loading and never fetches when cycleId is null', () => {
    const gateway = new StubBottleneckAnalysisGateway();
    overrideUsecases({
      getBottleneckAnalysis: new GetBottleneckAnalysisUsecase(gateway),
    });

    const { result } = renderHook(
      () =>
        useBottleneckAnalysis({
          teamId: 'team-1',
          cycleId: null,
          selectedMemberName: null,
        }),
      { wrapper },
    );

    expect(result.current.state.status).toBe('loading');
    expect(gateway.calls).toEqual([]);
  });
});
