import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { overrideUsecases, resetUsecases } from '@/main/dependencies.ts';
import { useTopCycleAssignees } from '@/modules/analytics/interface-adapters/hooks/use-top-cycle-assignees.ts';
import { FailingTopCycleAssigneesGateway } from '@/modules/analytics/testing/bad-path/failing.top-cycle-assignees.in-memory.gateway.ts';
import { StubTopCycleAssigneesGateway } from '@/modules/analytics/testing/good-path/stub.top-cycle-assignees.in-memory.gateway.ts';
import { GetTopCycleAssigneesUsecase } from '@/modules/analytics/usecases/get-top-cycle-assignees.usecase.ts';
import { ListCycleAssigneeIssuesUsecase } from '@/modules/analytics/usecases/list-cycle-assignee-issues.usecase.ts';
import {
  createTestQueryClient,
  withQueryClient,
} from '../../../../helpers/query-client-wrapper.tsx';

function wrapper({ children }: { children: ReactNode }) {
  return withQueryClient(children, createTestQueryClient());
}

describe('useTopCycleAssignees', () => {
  afterEach(() => {
    resetUsecases();
  });

  it('exposes a loading state on first render when a teamId is provided', () => {
    const gateway = new StubTopCycleAssigneesGateway({
      ranking: { status: 'no_active_cycle' },
    });
    overrideUsecases({
      getTopCycleAssignees: new GetTopCycleAssigneesUsecase(gateway),
      listCycleAssigneeIssues: new ListCycleAssigneeIssuesUsecase(gateway),
    });

    const { result } = renderHook(
      () => useTopCycleAssignees({ teamId: 'team-1' }),
      { wrapper },
    );

    expect(result.current.state.status).toBe('loading');
  });

  it('transitions to ready with the ranking view model for the team', async () => {
    const gateway = new StubTopCycleAssigneesGateway({
      ranking: {
        status: 'ready',
        cycleId: 'cycle-1',
        cycleName: 'Cycle 1',
        assignees: [
          {
            assigneeName: 'Alice',
            issueCount: 5,
            totalPoints: 15,
            totalCycleTimeInHours: 30,
          },
        ],
      },
    });
    overrideUsecases({
      getTopCycleAssignees: new GetTopCycleAssigneesUsecase(gateway),
      listCycleAssigneeIssues: new ListCycleAssigneeIssuesUsecase(gateway),
    });

    const { result } = renderHook(
      () => useTopCycleAssignees({ teamId: 'team-1' }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });
    if (result.current.state.status === 'ready') {
      expect(result.current.state.data.rankingRows).toHaveLength(1);
    }
  });

  it('stays loading and never fetches when teamId is null', () => {
    const gateway = new StubTopCycleAssigneesGateway({
      ranking: { status: 'no_active_cycle' },
    });
    overrideUsecases({
      getTopCycleAssignees: new GetTopCycleAssigneesUsecase(gateway),
      listCycleAssigneeIssues: new ListCycleAssigneeIssuesUsecase(gateway),
    });

    const { result } = renderHook(
      () => useTopCycleAssignees({ teamId: null }),
      { wrapper },
    );

    expect(result.current.state.status).toBe('loading');
    expect(gateway.topCallCount).toBe(0);
  });

  it('transitions to error when the gateway fails', async () => {
    overrideUsecases({
      getTopCycleAssignees: new GetTopCycleAssigneesUsecase(
        new FailingTopCycleAssigneesGateway(),
      ),
      listCycleAssigneeIssues: new ListCycleAssigneeIssuesUsecase(
        new FailingTopCycleAssigneesGateway(),
      ),
    });

    const { result } = renderHook(
      () => useTopCycleAssignees({ teamId: 'team-1' }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('error');
    });
  });

  it('reorders the ranking when the user changes the active metric', async () => {
    const gateway = new StubTopCycleAssigneesGateway({
      ranking: {
        status: 'ready',
        cycleId: 'cycle-1',
        cycleName: 'Cycle 1',
        assignees: [
          {
            assigneeName: 'Alice',
            issueCount: 5,
            totalPoints: 15,
            totalCycleTimeInHours: 10,
          },
          {
            assigneeName: 'Bob',
            issueCount: 3,
            totalPoints: 24,
            totalCycleTimeInHours: 20,
          },
        ],
      },
    });
    overrideUsecases({
      getTopCycleAssignees: new GetTopCycleAssigneesUsecase(gateway),
      listCycleAssigneeIssues: new ListCycleAssigneeIssuesUsecase(gateway),
    });

    const { result } = renderHook(
      () => useTopCycleAssignees({ teamId: 'team-1' }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });

    act(() => {
      result.current.onMetricChange('points');
    });

    await waitFor(() => {
      if (result.current.state.status === 'ready') {
        expect(
          result.current.state.data.rankingRows.map((row) => row.assigneeName),
        ).toEqual(['Bob', 'Alice']);
      }
    });
  });

  it('opens the drawer and fetches issues when a row is clicked', async () => {
    const gateway = new StubTopCycleAssigneesGateway({
      ranking: {
        status: 'ready',
        cycleId: 'cycle-1',
        cycleName: 'Cycle 1',
        assignees: [
          {
            assigneeName: 'Alice',
            issueCount: 5,
            totalPoints: 15,
            totalCycleTimeInHours: 30,
          },
        ],
      },
      issuesByAssigneeName: {
        Alice: {
          status: 'ready',
          cycleId: 'cycle-1',
          assigneeName: 'Alice',
          issues: [
            {
              externalId: 'LIN-1',
              title: 'First',
              points: 3,
              totalCycleTimeInHours: 6,
              statusName: 'Done',
            },
          ],
        },
      },
    });
    overrideUsecases({
      getTopCycleAssignees: new GetTopCycleAssigneesUsecase(gateway),
      listCycleAssigneeIssues: new ListCycleAssigneeIssuesUsecase(gateway),
    });

    const { result } = renderHook(
      () => useTopCycleAssignees({ teamId: 'team-1' }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });

    act(() => {
      result.current.onRowClick('Alice');
    });

    await waitFor(() => {
      expect(result.current.drawerState.isOpen).toBe(true);
      expect(result.current.drawerState.showIssues).toBe(true);
    });
    expect(gateway.issuesCallCount).toBe(1);
  });

  it('closes the drawer when onDrawerClose is called', async () => {
    const gateway = new StubTopCycleAssigneesGateway({
      ranking: {
        status: 'ready',
        cycleId: 'cycle-1',
        cycleName: 'Cycle 1',
        assignees: [
          {
            assigneeName: 'Alice',
            issueCount: 5,
            totalPoints: 15,
            totalCycleTimeInHours: 30,
          },
        ],
      },
      issuesByAssigneeName: {
        Alice: {
          status: 'ready',
          cycleId: 'cycle-1',
          assigneeName: 'Alice',
          issues: [],
        },
      },
    });
    overrideUsecases({
      getTopCycleAssignees: new GetTopCycleAssigneesUsecase(gateway),
      listCycleAssigneeIssues: new ListCycleAssigneeIssuesUsecase(gateway),
    });

    const { result } = renderHook(
      () => useTopCycleAssignees({ teamId: 'team-1' }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });

    act(() => {
      result.current.onRowClick('Alice');
    });
    await waitFor(() => {
      expect(result.current.drawerState.isOpen).toBe(true);
    });

    act(() => {
      result.current.onDrawerClose();
    });

    expect(result.current.drawerState.isOpen).toBe(false);
  });

  it('resets metric and selected assignee when teamId changes', async () => {
    const gateway = new StubTopCycleAssigneesGateway({
      rankingByTeamId: {
        'team-1': {
          status: 'ready',
          cycleId: 'cycle-1',
          cycleName: 'Cycle 1',
          assignees: [
            {
              assigneeName: 'Alice',
              issueCount: 5,
              totalPoints: 15,
              totalCycleTimeInHours: 10,
            },
            {
              assigneeName: 'Bob',
              issueCount: 3,
              totalPoints: 24,
              totalCycleTimeInHours: 20,
            },
          ],
        },
        'team-2': {
          status: 'ready',
          cycleId: 'cycle-2',
          cycleName: 'Cycle 2',
          assignees: [
            {
              assigneeName: 'Zara',
              issueCount: 1,
              totalPoints: 1,
              totalCycleTimeInHours: 1,
            },
          ],
        },
      },
    });
    overrideUsecases({
      getTopCycleAssignees: new GetTopCycleAssigneesUsecase(gateway),
      listCycleAssigneeIssues: new ListCycleAssigneeIssuesUsecase(gateway),
    });

    const { result, rerender } = renderHook(
      ({ teamId }: { teamId: string }) => useTopCycleAssignees({ teamId }),
      { wrapper, initialProps: { teamId: 'team-1' } },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });

    act(() => {
      result.current.onMetricChange('points');
      result.current.onRowClick('Alice');
    });

    rerender({ teamId: 'team-2' });

    await waitFor(() => {
      if (result.current.state.status === 'ready') {
        expect(result.current.state.data.metricToggle.activeMetric).toBe(
          'count',
        );
        expect(result.current.drawerState.isOpen).toBe(false);
      }
    });
  });
});
