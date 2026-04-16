import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { overrideUsecases, resetUsecases } from '@/main/dependencies.ts';
import { useDriftingIssues } from '@/modules/analytics/interface-adapters/hooks/use-drifting-issues.ts';
import { FailingDriftingIssuesGateway } from '@/modules/analytics/testing/bad-path/failing.drifting-issues.in-memory.gateway.ts';
import { StubDriftingIssuesGateway } from '@/modules/analytics/testing/good-path/stub.drifting-issues.in-memory.gateway.ts';
import { ListDriftingIssuesUsecase } from '@/modules/analytics/usecases/list-drifting-issues.usecase.ts';
import { DriftingIssueResponseBuilder } from '../../../../builders/drifting-issue-response.builder.ts';
import {
  createTestQueryClient,
  withQueryClient,
} from '../../../../helpers/query-client-wrapper.tsx';

function wrapper({ children }: { children: ReactNode }) {
  return withQueryClient(children, createTestQueryClient());
}

describe('useDriftingIssues', () => {
  afterEach(() => {
    resetUsecases();
  });

  it('exposes a loading state on first render when teamId is provided', () => {
    overrideUsecases({
      listDriftingIssues: new ListDriftingIssuesUsecase(
        new StubDriftingIssuesGateway(),
      ),
    });

    const { result } = renderHook(
      () => useDriftingIssues({ teamId: 'team-1' }),
      { wrapper },
    );

    expect(result.current.state.status).toBe('loading');
  });

  it('transitions to ready with a view model when the gateway resolves', async () => {
    overrideUsecases({
      listDriftingIssues: new ListDriftingIssuesUsecase(
        new StubDriftingIssuesGateway({
          response: [
            new DriftingIssueResponseBuilder()
              .withIssueExternalId('LIN-100')
              .withIssueTitle('Drifting story')
              .build(),
          ],
        }),
      ),
    });

    const { result } = renderHook(
      () => useDriftingIssues({ teamId: 'team-1' }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });
    if (result.current.state.status === 'ready') {
      expect(result.current.state.data.rows.map((row) => row.id)).toEqual([
        'LIN-100',
      ]);
    }
  });

  it('transitions to error when the gateway fails', async () => {
    overrideUsecases({
      listDriftingIssues: new ListDriftingIssuesUsecase(
        new FailingDriftingIssuesGateway(),
      ),
    });

    const { result } = renderHook(
      () => useDriftingIssues({ teamId: 'team-1' }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('error');
    });
    if (result.current.state.status === 'error') {
      expect(result.current.state.message).toBe(
        'Failed to fetch drifting issues',
      );
    }
  });

  it('stays loading and never fetches when teamId is null', () => {
    const gateway = new StubDriftingIssuesGateway();
    overrideUsecases({
      listDriftingIssues: new ListDriftingIssuesUsecase(gateway),
    });

    const { result } = renderHook(() => useDriftingIssues({ teamId: null }), {
      wrapper,
    });

    expect(result.current.state.status).toBe('loading');
    expect(gateway.calls).toEqual([]);
  });
});
