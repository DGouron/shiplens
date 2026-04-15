import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { overrideUsecases, resetUsecases } from '@/main/dependencies.ts';
import { useBlockedIssues } from '@/modules/analytics/interface-adapters/hooks/use-blocked-issues.ts';
import { FailingBlockedIssuesGateway } from '@/modules/analytics/testing/bad-path/failing.blocked-issues.in-memory.gateway.ts';
import { StubBlockedIssuesGateway } from '@/modules/analytics/testing/good-path/stub.blocked-issues.in-memory.gateway.ts';
import { ListBlockedIssuesUsecase } from '@/modules/analytics/usecases/list-blocked-issues.usecase.ts';
import { BlockedIssueAlertResponseBuilder } from '../../../../builders/blocked-issue-alert-response.builder.ts';
import {
  createTestQueryClient,
  withQueryClient,
} from '../../../../helpers/query-client-wrapper.tsx';

function wrapper({ children }: { children: ReactNode }) {
  return withQueryClient(children, createTestQueryClient());
}

describe('useBlockedIssues', () => {
  afterEach(() => {
    resetUsecases();
  });

  it('exposes a loading state on first render when a teamId is provided', () => {
    overrideUsecases({
      listBlockedIssues: new ListBlockedIssuesUsecase(
        new StubBlockedIssuesGateway(),
      ),
    });

    const { result } = renderHook(
      () => useBlockedIssues({ teamId: 'team-1' }),
      { wrapper },
    );

    expect(result.current.state.status).toBe('loading');
  });

  it('transitions to ready with the view model filtered to the selected team', async () => {
    overrideUsecases({
      listBlockedIssues: new ListBlockedIssuesUsecase(
        new StubBlockedIssuesGateway({
          response: [
            new BlockedIssueAlertResponseBuilder()
              .withId('alert-matching')
              .withTeamId('team-alpha')
              .build(),
            new BlockedIssueAlertResponseBuilder()
              .withId('alert-other')
              .withTeamId('team-beta')
              .build(),
          ],
        }),
      ),
    });

    const { result } = renderHook(
      () => useBlockedIssues({ teamId: 'team-alpha' }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });
    if (result.current.state.status === 'ready') {
      expect(result.current.state.data.items.map((item) => item.id)).toEqual([
        'alert-matching',
      ]);
    }
  });

  it('transitions to error when the gateway fails', async () => {
    overrideUsecases({
      listBlockedIssues: new ListBlockedIssuesUsecase(
        new FailingBlockedIssuesGateway(),
      ),
    });

    const { result } = renderHook(
      () => useBlockedIssues({ teamId: 'team-1' }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('error');
    });
    if (result.current.state.status === 'error') {
      expect(result.current.state.message).toBe(
        'Failed to fetch blocked issues',
      );
    }
  });

  it('stays loading and never fetches when teamId is null', () => {
    const gateway = new StubBlockedIssuesGateway();
    overrideUsecases({
      listBlockedIssues: new ListBlockedIssuesUsecase(gateway),
    });

    const { result } = renderHook(() => useBlockedIssues({ teamId: null }), {
      wrapper,
    });

    expect(result.current.state.status).toBe('loading');
    expect(gateway.callCount).toBe(0);
  });
});
