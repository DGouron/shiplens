import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { overrideUsecases, resetUsecases } from '@/main/dependencies.ts';
import { useTopCycleThemes } from '@/modules/analytics/interface-adapters/hooks/use-top-cycle-themes.ts';
import { FailingTopCycleThemesGateway } from '@/modules/analytics/testing/bad-path/failing.top-cycle-themes.in-memory.gateway.ts';
import { StubTopCycleThemesGateway } from '@/modules/analytics/testing/good-path/stub.top-cycle-themes.in-memory.gateway.ts';
import { GetTopCycleThemesUsecase } from '@/modules/analytics/usecases/get-top-cycle-themes.usecase.ts';
import { ListCycleThemeIssuesUsecase } from '@/modules/analytics/usecases/list-cycle-theme-issues.usecase.ts';
import {
  createTestQueryClient,
  withQueryClient,
} from '../../../../helpers/query-client-wrapper.tsx';

function wrapper({ children }: { children: ReactNode }) {
  return withQueryClient(children, createTestQueryClient());
}

describe('useTopCycleThemes', () => {
  afterEach(() => {
    resetUsecases();
  });

  it('exposes a loading state on first render when a teamId is provided', () => {
    const gateway = new StubTopCycleThemesGateway({
      themes: { status: 'no_active_cycle' },
    });
    overrideUsecases({
      getTopCycleThemes: new GetTopCycleThemesUsecase(gateway),
      listCycleThemeIssues: new ListCycleThemeIssuesUsecase(gateway),
    });

    const { result } = renderHook(
      () => useTopCycleThemes({ teamId: 'team-1' }),
      { wrapper },
    );

    expect(result.current.state.status).toBe('loading');
  });

  it('exposes the localized loading message and hint so the view can explain the slow AI call', () => {
    const gateway = new StubTopCycleThemesGateway({
      themes: { status: 'no_active_cycle' },
    });
    overrideUsecases({
      getTopCycleThemes: new GetTopCycleThemesUsecase(gateway),
      listCycleThemeIssues: new ListCycleThemeIssuesUsecase(gateway),
    });

    const { result } = renderHook(
      () => useTopCycleThemes({ teamId: 'team-1' }),
      { wrapper },
    );

    expect(result.current.loadingMessage).toBe(
      'Detecting cycle themes with AI…',
    );
    expect(result.current.loadingHint).toBe('This can take up to 30 seconds.');
  });

  it('transitions to ready with the themes view model for the team', async () => {
    const gateway = new StubTopCycleThemesGateway({
      themes: {
        status: 'ready',
        cycleId: 'cycle-1',
        cycleName: 'Cycle 1',
        language: 'EN',
        fromCache: false,
        themes: [
          {
            name: 'Auth refactor',
            issueCount: 5,
            totalPoints: 10,
            totalCycleTimeInHours: 20,
          },
        ],
      },
    });
    overrideUsecases({
      getTopCycleThemes: new GetTopCycleThemesUsecase(gateway),
      listCycleThemeIssues: new ListCycleThemeIssuesUsecase(gateway),
    });

    const { result } = renderHook(
      () => useTopCycleThemes({ teamId: 'team-1' }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });
    if (result.current.state.status === 'ready') {
      expect(result.current.state.data.rankingRows).toHaveLength(1);
      expect(result.current.state.data.showRefreshButton).toBe(true);
    }
  });

  it('stays loading and never fetches when teamId is null', () => {
    const gateway = new StubTopCycleThemesGateway({
      themes: { status: 'no_active_cycle' },
    });
    overrideUsecases({
      getTopCycleThemes: new GetTopCycleThemesUsecase(gateway),
      listCycleThemeIssues: new ListCycleThemeIssuesUsecase(gateway),
    });

    const { result } = renderHook(() => useTopCycleThemes({ teamId: null }), {
      wrapper,
    });

    expect(result.current.state.status).toBe('loading');
    expect(gateway.topCallCount).toBe(0);
  });

  it('transitions to error when the gateway fails', async () => {
    overrideUsecases({
      getTopCycleThemes: new GetTopCycleThemesUsecase(
        new FailingTopCycleThemesGateway(),
      ),
      listCycleThemeIssues: new ListCycleThemeIssuesUsecase(
        new FailingTopCycleThemesGateway(),
      ),
    });

    const { result } = renderHook(
      () => useTopCycleThemes({ teamId: 'team-1' }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('error');
    });
  });

  it('reorders the ranking when the user changes the active metric', async () => {
    const gateway = new StubTopCycleThemesGateway({
      themes: {
        status: 'ready',
        cycleId: 'cycle-1',
        cycleName: 'Cycle 1',
        language: 'EN',
        fromCache: false,
        themes: [
          {
            name: 'Auth refactor',
            issueCount: 7,
            totalPoints: 12,
            totalCycleTimeInHours: 30,
          },
          {
            name: 'Payments bugs',
            issueCount: 4,
            totalPoints: 30,
            totalCycleTimeInHours: 20,
          },
        ],
      },
    });
    overrideUsecases({
      getTopCycleThemes: new GetTopCycleThemesUsecase(gateway),
      listCycleThemeIssues: new ListCycleThemeIssuesUsecase(gateway),
    });

    const { result } = renderHook(
      () => useTopCycleThemes({ teamId: 'team-1' }),
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
          result.current.state.data.rankingRows.map((row) => row.themeName),
        ).toEqual(['Payments bugs', 'Auth refactor']);
      }
    });
  });

  it('opens the drawer and fetches issues when a row is clicked', async () => {
    const gateway = new StubTopCycleThemesGateway({
      themes: {
        status: 'ready',
        cycleId: 'cycle-1',
        cycleName: 'Cycle 1',
        language: 'EN',
        fromCache: false,
        themes: [
          {
            name: 'Auth refactor',
            issueCount: 5,
            totalPoints: 10,
            totalCycleTimeInHours: 20,
          },
        ],
      },
      issuesByThemeName: {
        'Auth refactor': {
          status: 'ready',
          cycleId: 'cycle-1',
          cycleName: 'Cycle 1',
          themeName: 'Auth refactor',
          issues: [
            {
              externalId: 'LIN-1',
              title: 'Fix auth flow',
              assigneeName: 'Alice',
              points: 3,
              statusName: 'Done',
              linearUrl: 'https://linear.app/issue/LIN-1',
            },
          ],
        },
      },
    });
    overrideUsecases({
      getTopCycleThemes: new GetTopCycleThemesUsecase(gateway),
      listCycleThemeIssues: new ListCycleThemeIssuesUsecase(gateway),
    });

    const { result } = renderHook(
      () => useTopCycleThemes({ teamId: 'team-1' }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });

    act(() => {
      result.current.onRowClick('Auth refactor');
    });

    await waitFor(() => {
      expect(result.current.drawerState.isOpen).toBe(true);
      expect(result.current.drawerState.showIssues).toBe(true);
    });
    expect(gateway.issuesCallCount).toBe(1);
  });

  it('closes the drawer when onDrawerClose is called', async () => {
    const gateway = new StubTopCycleThemesGateway({
      themes: {
        status: 'ready',
        cycleId: 'cycle-1',
        cycleName: 'Cycle 1',
        language: 'EN',
        fromCache: false,
        themes: [
          {
            name: 'Auth refactor',
            issueCount: 5,
            totalPoints: 10,
            totalCycleTimeInHours: 20,
          },
        ],
      },
      issuesByThemeName: {
        'Auth refactor': {
          status: 'ready',
          cycleId: 'cycle-1',
          cycleName: 'Cycle 1',
          themeName: 'Auth refactor',
          issues: [],
        },
      },
    });
    overrideUsecases({
      getTopCycleThemes: new GetTopCycleThemesUsecase(gateway),
      listCycleThemeIssues: new ListCycleThemeIssuesUsecase(gateway),
    });

    const { result } = renderHook(
      () => useTopCycleThemes({ teamId: 'team-1' }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });

    act(() => {
      result.current.onRowClick('Auth refactor');
    });
    await waitFor(() => {
      expect(result.current.drawerState.isOpen).toBe(true);
    });

    act(() => {
      result.current.onDrawerClose();
    });

    expect(result.current.drawerState.isOpen).toBe(false);
  });

  it('resets metric and selected theme when teamId changes', async () => {
    const gateway = new StubTopCycleThemesGateway({
      themesByTeamId: {
        'team-1': {
          status: 'ready',
          cycleId: 'cycle-1',
          cycleName: 'Cycle 1',
          language: 'EN',
          fromCache: false,
          themes: [
            {
              name: 'Auth refactor',
              issueCount: 7,
              totalPoints: 12,
              totalCycleTimeInHours: 30,
            },
            {
              name: 'Payments bugs',
              issueCount: 4,
              totalPoints: 30,
              totalCycleTimeInHours: 20,
            },
          ],
        },
        'team-2': {
          status: 'ready',
          cycleId: 'cycle-2',
          cycleName: 'Cycle 2',
          language: 'EN',
          fromCache: false,
          themes: [
            {
              name: 'Bravo theme',
              issueCount: 1,
              totalPoints: 1,
              totalCycleTimeInHours: 1,
            },
          ],
        },
      },
    });
    overrideUsecases({
      getTopCycleThemes: new GetTopCycleThemesUsecase(gateway),
      listCycleThemeIssues: new ListCycleThemeIssuesUsecase(gateway),
    });

    const { result, rerender } = renderHook(
      ({ teamId }: { teamId: string }) => useTopCycleThemes({ teamId }),
      { wrapper, initialProps: { teamId: 'team-1' } },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });

    act(() => {
      result.current.onMetricChange('points');
      result.current.onRowClick('Auth refactor');
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

  it('re-fetches with forceRefresh=true when onRefreshClick is called', async () => {
    const gateway = new StubTopCycleThemesGateway({
      themes: {
        status: 'ready',
        cycleId: 'cycle-1',
        cycleName: 'Cycle 1',
        language: 'EN',
        fromCache: true,
        themes: [
          {
            name: 'Auth refactor',
            issueCount: 5,
            totalPoints: 10,
            totalCycleTimeInHours: 20,
          },
        ],
      },
    });
    overrideUsecases({
      getTopCycleThemes: new GetTopCycleThemesUsecase(gateway),
      listCycleThemeIssues: new ListCycleThemeIssuesUsecase(gateway),
    });

    const { result } = renderHook(
      () => useTopCycleThemes({ teamId: 'team-1' }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });
    const initialCallCount = gateway.topCallCount;
    expect(gateway.lastForceRefresh).toBe(false);

    act(() => {
      result.current.onRefreshClick();
    });

    await waitFor(() => {
      expect(gateway.topCallCount).toBeGreaterThan(initialCallCount);
    });
    expect(gateway.lastForceRefresh).toBe(true);
  });

  it('exposes showRefreshButton=true on the ai_unavailable state', async () => {
    const gateway = new StubTopCycleThemesGateway({
      themes: { status: 'ai_unavailable' },
    });
    overrideUsecases({
      getTopCycleThemes: new GetTopCycleThemesUsecase(gateway),
      listCycleThemeIssues: new ListCycleThemeIssuesUsecase(gateway),
    });

    const { result } = renderHook(
      () => useTopCycleThemes({ teamId: 'team-1' }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });
    if (result.current.state.status === 'ready') {
      expect(result.current.state.data.showRefreshButton).toBe(true);
      expect(result.current.state.data.emptyTone).toBe('warning');
    }
  });

  it('exposes the localized cardTitle even when the query is still loading', () => {
    const gateway = new StubTopCycleThemesGateway({
      themes: { status: 'no_active_cycle' },
    });
    overrideUsecases({
      getTopCycleThemes: new GetTopCycleThemesUsecase(gateway),
      listCycleThemeIssues: new ListCycleThemeIssuesUsecase(gateway),
    });

    const { result } = renderHook(
      () => useTopCycleThemes({ teamId: 'team-1' }),
      { wrapper },
    );

    expect(result.current.state.status).toBe('loading');
    expect(result.current.cardTitle).toBe('Top 5 cycle themes');
  });

  it('exposes showRefreshButton=false on the below_threshold state', async () => {
    const gateway = new StubTopCycleThemesGateway({
      themes: { status: 'below_threshold', issueCount: 7 },
    });
    overrideUsecases({
      getTopCycleThemes: new GetTopCycleThemesUsecase(gateway),
      listCycleThemeIssues: new ListCycleThemeIssuesUsecase(gateway),
    });

    const { result } = renderHook(
      () => useTopCycleThemes({ teamId: 'team-1' }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });
    if (result.current.state.status === 'ready') {
      expect(result.current.state.data.showRefreshButton).toBe(false);
    }
  });
});
