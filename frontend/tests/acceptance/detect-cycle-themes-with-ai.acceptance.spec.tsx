import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, Navigate, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '@/app.tsx';
import { LocaleProvider, useSetLocale } from '@/locale-context.tsx';
import { overrideUsecases, resetUsecases } from '@/main/dependencies.ts';
import { type WorkspaceDashboardDataResponse } from '@/modules/analytics/entities/workspace-dashboard/workspace-dashboard.response.ts';
import { DashboardView } from '@/modules/analytics/interface-adapters/views/dashboard.view.tsx';
import { StubTeamSelectionStorageGateway } from '@/modules/analytics/testing/good-path/stub.team-selection-storage.in-memory.gateway.ts';
import { StubTopCycleAssigneesGateway } from '@/modules/analytics/testing/good-path/stub.top-cycle-assignees.in-memory.gateway.ts';
import { StubTopCycleProjectsGateway } from '@/modules/analytics/testing/good-path/stub.top-cycle-projects.in-memory.gateway.ts';
import { StubTopCycleThemesGateway } from '@/modules/analytics/testing/good-path/stub.top-cycle-themes.in-memory.gateway.ts';
import { StubWorkspaceDashboardGateway } from '@/modules/analytics/testing/good-path/stub.workspace-dashboard.in-memory.gateway.ts';
import { GetPersistedTeamSelectionUsecase } from '@/modules/analytics/usecases/get-persisted-team-selection.usecase.ts';
import { GetTopCycleAssigneesUsecase } from '@/modules/analytics/usecases/get-top-cycle-assignees.usecase.ts';
import { GetTopCycleProjectsUsecase } from '@/modules/analytics/usecases/get-top-cycle-projects.usecase.ts';
import { GetTopCycleThemesUsecase } from '@/modules/analytics/usecases/get-top-cycle-themes.usecase.ts';
import { GetWorkspaceDashboardUsecase } from '@/modules/analytics/usecases/get-workspace-dashboard.usecase.ts';
import { ListCycleAssigneeIssuesUsecase } from '@/modules/analytics/usecases/list-cycle-assignee-issues.usecase.ts';
import { ListCycleProjectIssuesUsecase } from '@/modules/analytics/usecases/list-cycle-project-issues.usecase.ts';
import { ListCycleThemeIssuesUsecase } from '@/modules/analytics/usecases/list-cycle-theme-issues.usecase.ts';
import { PersistTeamSelectionUsecase } from '@/modules/analytics/usecases/persist-team-selection.usecase.ts';
import { TeamDashboardResponseBuilder } from '../builders/team-dashboard-response.builder.ts';
import { WorkspaceDashboardResponseBuilder } from '../builders/workspace-dashboard-response.builder.ts';
import { withQueryClient } from '../helpers/query-client-wrapper.tsx';

interface WireParams {
  dashboard: WorkspaceDashboardDataResponse;
  storage: StubTeamSelectionStorageGateway;
  themesGateway: StubTopCycleThemesGateway;
}

function wire({ dashboard, storage, themesGateway }: WireParams): void {
  const projectsGateway = new StubTopCycleProjectsGateway({
    ranking: { status: 'no_active_cycle' },
  });
  const assigneesGateway = new StubTopCycleAssigneesGateway({
    ranking: { status: 'no_active_cycle' },
  });
  overrideUsecases({
    getWorkspaceDashboard: new GetWorkspaceDashboardUsecase(
      new StubWorkspaceDashboardGateway({ response: dashboard }),
    ),
    getPersistedTeamSelection: new GetPersistedTeamSelectionUsecase(storage),
    persistTeamSelection: new PersistTeamSelectionUsecase(storage),
    getTopCycleProjects: new GetTopCycleProjectsUsecase(projectsGateway),
    listCycleProjectIssues: new ListCycleProjectIssuesUsecase(projectsGateway),
    getTopCycleAssignees: new GetTopCycleAssigneesUsecase(assigneesGateway),
    listCycleAssigneeIssues: new ListCycleAssigneeIssuesUsecase(
      assigneesGateway,
    ),
    getTopCycleThemes: new GetTopCycleThemesUsecase(themesGateway),
    listCycleThemeIssues: new ListCycleThemeIssuesUsecase(themesGateway),
  });
}

function renderAtPath(initialPath: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <App />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardView /> },
        ],
      },
    ],
    { initialEntries: [initialPath] },
  );
  return render(withQueryClient(<RouterProvider router={router} />));
}

function LocaleSwitch({ locale }: { locale: 'en' | 'fr' }) {
  const setLocale = useSetLocale();
  return (
    <button type="button" onClick={() => setLocale(locale)}>
      switch-to-{locale}
    </button>
  );
}

function renderWithLocaleProvider(initialPath: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <App />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardView /> },
        ],
      },
    ],
    { initialEntries: [initialPath] },
  );
  return render(
    withQueryClient(
      <LocaleProvider>
        <LocaleSwitch locale="fr" />
        <RouterProvider router={router} />
      </LocaleProvider>,
    ),
  );
}

function buildDashboardWithTeam(
  teamId: string,
  teamName: string,
): WorkspaceDashboardDataResponse {
  return new WorkspaceDashboardResponseBuilder()
    .withWorkspaceId('workspace-1')
    .withTeams([
      new TeamDashboardResponseBuilder()
        .withTeamId(teamId)
        .withTeamName(teamName)
        .build(),
    ])
    .build();
}

describe('Detect cycle themes with AI (acceptance)', () => {
  let storage: StubTeamSelectionStorageGateway;

  beforeEach(() => {
    storage = new StubTeamSelectionStorageGateway();
  });

  afterEach(() => {
    resetUsecases();
    vi.restoreAllMocks();
  });

  it('nominal AI themes: 5 themes sorted by count descending', async () => {
    const themesGateway = new StubTopCycleThemesGateway({
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
            issueCount: 5,
            totalPoints: 10,
            totalCycleTimeInHours: 20,
          },
          {
            name: 'Onboarding polish',
            issueCount: 4,
            totalPoints: 8,
            totalCycleTimeInHours: 15,
          },
          {
            name: 'API hardening',
            issueCount: 3,
            totalPoints: 6,
            totalCycleTimeInHours: 10,
          },
          {
            name: 'Tech debt',
            issueCount: 2,
            totalPoints: 4,
            totalCycleTimeInHours: 5,
          },
        ],
      },
    });
    wire({
      dashboard: buildDashboardWithTeam('team-1', 'Team One'),
      storage,
      themesGateway,
    });

    renderAtPath('/dashboard');

    const rows = await waitFor(() =>
      screen.getAllByTestId('top-cycle-themes-row'),
    );
    expect(rows).toHaveLength(5);
    expect(rows.map((row) => row.textContent)).toEqual([
      expect.stringContaining('Auth refactor'),
      expect.stringContaining('Payments bugs'),
      expect.stringContaining('Onboarding polish'),
      expect.stringContaining('API hardening'),
      expect.stringContaining('Tech debt'),
    ]);
  });

  it('below threshold: card displays the not-enough-issues message and no refresh button', async () => {
    const themesGateway = new StubTopCycleThemesGateway({
      themes: { status: 'below_threshold', issueCount: 7 },
    });
    wire({
      dashboard: buildDashboardWithTeam('team-1', 'Team One'),
      storage,
      themesGateway,
    });

    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(
        screen.getByText('Not enough issues for theme detection.'),
      ).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: 'Refresh' })).toBeNull();
  });

  it('AI unavailable: card shows warning + refresh button, other widgets remain', async () => {
    const themesGateway = new StubTopCycleThemesGateway({
      themes: { status: 'ai_unavailable' },
    });
    wire({
      dashboard: buildDashboardWithTeam('team-1', 'Team One'),
      storage,
      themesGateway,
    });

    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(
        screen.getByText('Theme detection is temporarily unavailable.'),
      ).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    expect(screen.getByText('Top 5 cycle assignees')).toBeInTheDocument();
  });

  it('no active cycle: card displays the no-active-cycle message', async () => {
    const themesGateway = new StubTopCycleThemesGateway({
      themes: { status: 'no_active_cycle' },
    });
    wire({
      dashboard: buildDashboardWithTeam('team-1', 'Team One'),
      storage,
      themesGateway,
    });

    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(
        screen.getAllByText('No active cycle for this team.').length,
      ).toBeGreaterThan(0);
    });
  });

  it('team switch reloads: card re-fetches themes for the new team', async () => {
    const themesGateway = new StubTopCycleThemesGateway({
      themesByTeamId: {
        'team-alpha': {
          status: 'ready',
          cycleId: 'cycle-alpha',
          cycleName: 'Alpha cycle',
          language: 'EN',
          fromCache: false,
          themes: [
            {
              name: 'Alpha theme',
              issueCount: 5,
              totalPoints: 10,
              totalCycleTimeInHours: 20,
            },
          ],
        },
        'team-bravo': {
          status: 'ready',
          cycleId: 'cycle-bravo',
          cycleName: 'Bravo cycle',
          language: 'EN',
          fromCache: false,
          themes: [
            {
              name: 'Bravo theme',
              issueCount: 3,
              totalPoints: 6,
              totalCycleTimeInHours: 10,
            },
          ],
        },
      },
    });
    const dashboard = new WorkspaceDashboardResponseBuilder()
      .withWorkspaceId('workspace-1')
      .withTeams([
        new TeamDashboardResponseBuilder()
          .withTeamId('team-alpha')
          .withTeamName('Alpha')
          .build(),
        new TeamDashboardResponseBuilder()
          .withTeamId('team-bravo')
          .withTeamName('Bravo')
          .build(),
      ])
      .build();
    wire({ dashboard, storage, themesGateway });

    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(screen.getByText('Alpha theme')).toBeInTheDocument();
    });

    const bravoCard = screen.getByRole('button', { name: /Bravo/ });
    fireEvent.click(bravoCard);

    await waitFor(() => {
      expect(screen.getByText('Bravo theme')).toBeInTheDocument();
    });
  });

  it('manual refresh: clicking the refresh button re-fetches with forceRefresh=true', async () => {
    const themesGateway = new StubTopCycleThemesGateway({
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
    wire({
      dashboard: buildDashboardWithTeam('team-1', 'Team One'),
      storage,
      themesGateway,
    });

    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(screen.getByText('Auth refactor')).toBeInTheDocument();
    });
    const initialCallCount = themesGateway.topCallCount;
    expect(themesGateway.lastForceRefresh).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));

    await waitFor(() => {
      expect(themesGateway.topCallCount).toBeGreaterThan(initialCallCount);
    });
    expect(themesGateway.lastForceRefresh).toBe(true);
  });

  it('sort by points: rows reorder when the points metric is selected', async () => {
    const themesGateway = new StubTopCycleThemesGateway({
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
    wire({
      dashboard: buildDashboardWithTeam('team-1', 'Team One'),
      storage,
      themesGateway,
    });

    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(screen.getAllByTestId('top-cycle-themes-row')).toHaveLength(2);
    });

    const pointsTabs = screen.getAllByRole('tab', { name: 'Points' });
    fireEvent.click(pointsTabs[pointsTabs.length - 1]);

    await waitFor(() => {
      const rows = screen.getAllByTestId('top-cycle-themes-row');
      expect(rows[0].textContent).toContain('Payments bugs');
      expect(rows[1].textContent).toContain('Auth refactor');
    });
  });

  it('click row opens drawer with the theme issues', async () => {
    const themesGateway = new StubTopCycleThemesGateway({
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
    wire({
      dashboard: buildDashboardWithTeam('team-1', 'Team One'),
      storage,
      themesGateway,
    });

    renderAtPath('/dashboard');

    const row = await waitFor(() => screen.getByTestId('top-cycle-themes-row'));
    fireEvent.click(row);

    await waitFor(() => {
      expect(screen.getByText('Fix auth flow')).toBeInTheDocument();
    });
  });

  it('language switch: static labels re-render in French, theme names stay as returned', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ language: 'en' }),
      }),
    );
    const themesGateway = new StubTopCycleThemesGateway({
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
    wire({
      dashboard: buildDashboardWithTeam('team-1', 'Team One'),
      storage,
      themesGateway,
    });

    renderWithLocaleProvider('/dashboard');

    await waitFor(() => {
      expect(screen.getByText('Top 5 cycle themes')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'switch-to-fr' }));

    await waitFor(() => {
      expect(screen.getByText('Top 5 themes du cycle')).toBeInTheDocument();
    });
    expect(screen.getByText('Auth refactor')).toBeInTheDocument();
  });

  it('fewer than 5 themes: only the returned rows are rendered', async () => {
    const themesGateway = new StubTopCycleThemesGateway({
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
          {
            name: 'Payments bugs',
            issueCount: 3,
            totalPoints: 6,
            totalCycleTimeInHours: 12,
          },
          {
            name: 'Tech debt',
            issueCount: 2,
            totalPoints: 4,
            totalCycleTimeInHours: 6,
          },
        ],
      },
    });
    wire({
      dashboard: buildDashboardWithTeam('team-1', 'Team One'),
      storage,
      themesGateway,
    });

    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(screen.getAllByTestId('top-cycle-themes-row')).toHaveLength(3);
    });
  });
});
