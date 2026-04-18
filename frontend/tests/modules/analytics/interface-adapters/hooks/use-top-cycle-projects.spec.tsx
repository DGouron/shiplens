import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { overrideUsecases, resetUsecases } from '@/main/dependencies.ts';
import { useTopCycleProjects } from '@/modules/analytics/interface-adapters/hooks/use-top-cycle-projects.ts';
import { FailingTopCycleProjectsGateway } from '@/modules/analytics/testing/bad-path/failing.top-cycle-projects.in-memory.gateway.ts';
import { StubTopCycleProjectsGateway } from '@/modules/analytics/testing/good-path/stub.top-cycle-projects.in-memory.gateway.ts';
import { GetTopCycleProjectsUsecase } from '@/modules/analytics/usecases/get-top-cycle-projects.usecase.ts';
import { ListCycleProjectIssuesUsecase } from '@/modules/analytics/usecases/list-cycle-project-issues.usecase.ts';
import {
  createTestQueryClient,
  withQueryClient,
} from '../../../../helpers/query-client-wrapper.tsx';

function wrapper({ children }: { children: ReactNode }) {
  return withQueryClient(children, createTestQueryClient());
}

describe('useTopCycleProjects', () => {
  afterEach(() => {
    resetUsecases();
  });

  it('exposes a loading state on first render when a teamId is provided', () => {
    const gateway = new StubTopCycleProjectsGateway({
      ranking: { status: 'no_active_cycle' },
    });
    overrideUsecases({
      getTopCycleProjects: new GetTopCycleProjectsUsecase(gateway),
      listCycleProjectIssues: new ListCycleProjectIssuesUsecase(gateway),
    });

    const { result } = renderHook(
      () => useTopCycleProjects({ teamId: 'team-1' }),
      { wrapper },
    );

    expect(result.current.state.status).toBe('loading');
  });

  it('transitions to ready with the ranking view model for the team', async () => {
    const gateway = new StubTopCycleProjectsGateway({
      ranking: {
        status: 'ready',
        cycleId: 'cycle-1',
        cycleName: 'Cycle 1',
        projects: [
          {
            projectId: 'proj-a',
            projectName: 'Alpha',
            isNoProjectBucket: false,
            issueCount: 5,
            totalPoints: 8,
            totalCycleTimeInHours: 10,
          },
        ],
      },
    });
    overrideUsecases({
      getTopCycleProjects: new GetTopCycleProjectsUsecase(gateway),
      listCycleProjectIssues: new ListCycleProjectIssuesUsecase(gateway),
    });

    const { result } = renderHook(
      () => useTopCycleProjects({ teamId: 'team-1' }),
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
    const gateway = new StubTopCycleProjectsGateway({
      ranking: { status: 'no_active_cycle' },
    });
    overrideUsecases({
      getTopCycleProjects: new GetTopCycleProjectsUsecase(gateway),
      listCycleProjectIssues: new ListCycleProjectIssuesUsecase(gateway),
    });

    const { result } = renderHook(() => useTopCycleProjects({ teamId: null }), {
      wrapper,
    });

    expect(result.current.state.status).toBe('loading');
    expect(gateway.topCallCount).toBe(0);
  });

  it('transitions to error when the gateway fails', async () => {
    overrideUsecases({
      getTopCycleProjects: new GetTopCycleProjectsUsecase(
        new FailingTopCycleProjectsGateway(),
      ),
      listCycleProjectIssues: new ListCycleProjectIssuesUsecase(
        new FailingTopCycleProjectsGateway(),
      ),
    });

    const { result } = renderHook(
      () => useTopCycleProjects({ teamId: 'team-1' }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('error');
    });
  });

  it('reorders the ranking when the user changes the active metric', async () => {
    const gateway = new StubTopCycleProjectsGateway({
      ranking: {
        status: 'ready',
        cycleId: 'cycle-1',
        cycleName: 'Cycle 1',
        projects: [
          {
            projectId: 'proj-a',
            projectName: 'Alpha',
            isNoProjectBucket: false,
            issueCount: 5,
            totalPoints: 8,
            totalCycleTimeInHours: 10,
          },
          {
            projectId: 'proj-b',
            projectName: 'Beta',
            isNoProjectBucket: false,
            issueCount: 3,
            totalPoints: 15,
            totalCycleTimeInHours: 20,
          },
        ],
      },
    });
    overrideUsecases({
      getTopCycleProjects: new GetTopCycleProjectsUsecase(gateway),
      listCycleProjectIssues: new ListCycleProjectIssuesUsecase(gateway),
    });

    const { result } = renderHook(
      () => useTopCycleProjects({ teamId: 'team-1' }),
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
          result.current.state.data.rankingRows.map((row) => row.projectId),
        ).toEqual(['proj-b', 'proj-a']);
      }
    });
  });

  it('opens the drawer and fetches issues when a row is clicked', async () => {
    const gateway = new StubTopCycleProjectsGateway({
      ranking: {
        status: 'ready',
        cycleId: 'cycle-1',
        cycleName: 'Cycle 1',
        projects: [
          {
            projectId: 'proj-a',
            projectName: 'Alpha',
            isNoProjectBucket: false,
            issueCount: 5,
            totalPoints: 8,
            totalCycleTimeInHours: 10,
          },
        ],
      },
      issuesByProjectId: {
        'proj-a': {
          status: 'ready',
          cycleId: 'cycle-1',
          projectId: 'proj-a',
          projectName: 'Alpha',
          isNoProjectBucket: false,
          issues: [
            {
              externalId: 'LIN-1',
              title: 'First',
              assigneeName: 'Alice',
              points: 3,
              statusName: 'Done',
            },
          ],
        },
      },
    });
    overrideUsecases({
      getTopCycleProjects: new GetTopCycleProjectsUsecase(gateway),
      listCycleProjectIssues: new ListCycleProjectIssuesUsecase(gateway),
    });

    const { result } = renderHook(
      () => useTopCycleProjects({ teamId: 'team-1' }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });

    act(() => {
      result.current.onRowClick('proj-a');
    });

    await waitFor(() => {
      expect(result.current.drawerState.isOpen).toBe(true);
      expect(result.current.drawerState.showIssues).toBe(true);
    });
    expect(gateway.issuesCallCount).toBe(1);
  });

  it('closes the drawer when onDrawerClose is called', async () => {
    const gateway = new StubTopCycleProjectsGateway({
      ranking: {
        status: 'ready',
        cycleId: 'cycle-1',
        cycleName: 'Cycle 1',
        projects: [
          {
            projectId: 'proj-a',
            projectName: 'Alpha',
            isNoProjectBucket: false,
            issueCount: 5,
            totalPoints: 8,
            totalCycleTimeInHours: 10,
          },
        ],
      },
      issuesByProjectId: {
        'proj-a': {
          status: 'ready',
          cycleId: 'cycle-1',
          projectId: 'proj-a',
          projectName: 'Alpha',
          isNoProjectBucket: false,
          issues: [],
        },
      },
    });
    overrideUsecases({
      getTopCycleProjects: new GetTopCycleProjectsUsecase(gateway),
      listCycleProjectIssues: new ListCycleProjectIssuesUsecase(gateway),
    });

    const { result } = renderHook(
      () => useTopCycleProjects({ teamId: 'team-1' }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });

    act(() => {
      result.current.onRowClick('proj-a');
    });
    await waitFor(() => {
      expect(result.current.drawerState.isOpen).toBe(true);
    });

    act(() => {
      result.current.onDrawerClose();
    });

    expect(result.current.drawerState.isOpen).toBe(false);
  });
});
