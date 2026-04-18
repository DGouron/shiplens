import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, Navigate, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '@/app.tsx';
import { LocaleProvider, useSetLocale } from '@/locale-context.tsx';
import { overrideUsecases, resetUsecases } from '@/main/dependencies.ts';
import { type WorkspaceDashboardDataResponse } from '@/modules/analytics/entities/workspace-dashboard/workspace-dashboard.response.ts';
import { DashboardView } from '@/modules/analytics/interface-adapters/views/dashboard.view.tsx';
import { StubTeamSelectionStorageGateway } from '@/modules/analytics/testing/good-path/stub.team-selection-storage.in-memory.gateway.ts';
import { StubTopCycleProjectsGateway } from '@/modules/analytics/testing/good-path/stub.top-cycle-projects.in-memory.gateway.ts';
import { StubWorkspaceDashboardGateway } from '@/modules/analytics/testing/good-path/stub.workspace-dashboard.in-memory.gateway.ts';
import { GetPersistedTeamSelectionUsecase } from '@/modules/analytics/usecases/get-persisted-team-selection.usecase.ts';
import { GetTopCycleProjectsUsecase } from '@/modules/analytics/usecases/get-top-cycle-projects.usecase.ts';
import { GetWorkspaceDashboardUsecase } from '@/modules/analytics/usecases/get-workspace-dashboard.usecase.ts';
import { ListCycleProjectIssuesUsecase } from '@/modules/analytics/usecases/list-cycle-project-issues.usecase.ts';
import { PersistTeamSelectionUsecase } from '@/modules/analytics/usecases/persist-team-selection.usecase.ts';
import { TeamDashboardResponseBuilder } from '../builders/team-dashboard-response.builder.ts';
import { WorkspaceDashboardResponseBuilder } from '../builders/workspace-dashboard-response.builder.ts';
import { withQueryClient } from '../helpers/query-client-wrapper.tsx';

interface WireParams {
  dashboard: WorkspaceDashboardDataResponse;
  storage: StubTeamSelectionStorageGateway;
  projectsGateway: StubTopCycleProjectsGateway;
}

function wire({ dashboard, storage, projectsGateway }: WireParams): void {
  overrideUsecases({
    getWorkspaceDashboard: new GetWorkspaceDashboardUsecase(
      new StubWorkspaceDashboardGateway({ response: dashboard }),
    ),
    getPersistedTeamSelection: new GetPersistedTeamSelectionUsecase(storage),
    persistTeamSelection: new PersistTeamSelectionUsecase(storage),
    getTopCycleProjects: new GetTopCycleProjectsUsecase(projectsGateway),
    listCycleProjectIssues: new ListCycleProjectIssuesUsecase(projectsGateway),
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

describe('Show top cycle projects (acceptance)', () => {
  let storage: StubTeamSelectionStorageGateway;

  beforeEach(() => {
    storage = new StubTeamSelectionStorageGateway();
  });

  afterEach(() => {
    resetUsecases();
    vi.restoreAllMocks();
  });

  it('nominal ranking by count: projects ordered by issueCount descending', async () => {
    const projectsGateway = new StubTopCycleProjectsGateway({
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
          {
            projectId: 'proj-c',
            projectName: 'Charlie',
            isNoProjectBucket: false,
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
      projectsGateway,
    });

    renderAtPath('/dashboard');

    const rows = await waitFor(() =>
      screen.getAllByTestId('top-cycle-projects-row'),
    );
    expect(rows.map((row) => row.textContent)).toEqual([
      expect.stringContaining('Alpha'),
      expect.stringContaining('Beta'),
      expect.stringContaining('Charlie'),
    ]);
  });

  it('fewer than 5 projects: only available rows are rendered', async () => {
    const projectsGateway = new StubTopCycleProjectsGateway({
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
    wire({
      dashboard: buildDashboardWithTeam('team-1', 'Team One'),
      storage,
      projectsGateway,
    });

    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(screen.getAllByTestId('top-cycle-projects-row')).toHaveLength(2);
    });
  });

  it('"No project" bucket appears in the ranking', async () => {
    const projectsGateway = new StubTopCycleProjectsGateway({
      ranking: {
        status: 'ready',
        cycleId: 'cycle-1',
        cycleName: 'Cycle 1',
        projects: [
          {
            projectId: 'proj-a',
            projectName: 'Alpha',
            isNoProjectBucket: false,
            issueCount: 7,
            totalPoints: 12,
            totalCycleTimeInHours: 30,
          },
          {
            projectId: '__no_project__',
            projectName: 'No project',
            isNoProjectBucket: true,
            issueCount: 3,
            totalPoints: 5,
            totalCycleTimeInHours: 8,
          },
        ],
      },
    });
    wire({
      dashboard: buildDashboardWithTeam('team-1', 'Team One'),
      storage,
      projectsGateway,
    });

    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(screen.getByText('No project')).toBeInTheDocument();
    });
  });

  it('sub-issue without project shown inside the No project bucket', async () => {
    const projectsGateway = new StubTopCycleProjectsGateway({
      ranking: {
        status: 'ready',
        cycleId: 'cycle-1',
        cycleName: 'Cycle 1',
        projects: [
          {
            projectId: '__no_project__',
            projectName: 'No project',
            isNoProjectBucket: true,
            issueCount: 1,
            totalPoints: 0,
            totalCycleTimeInHours: 0,
          },
        ],
      },
      issuesByProjectId: {
        __no_project__: {
          status: 'ready',
          cycleId: 'cycle-1',
          projectId: '__no_project__',
          projectName: 'No project',
          isNoProjectBucket: true,
          issues: [
            {
              externalId: 'LIN-99',
              title: 'Orphan sub-issue',
              assigneeName: 'Alice',
              points: null,
              statusName: 'In Progress',
            },
          ],
        },
      },
    });
    wire({
      dashboard: buildDashboardWithTeam('team-1', 'Team One'),
      storage,
      projectsGateway,
    });

    renderAtPath('/dashboard');

    const row = await waitFor(() => screen.getByText('No project'));
    fireEvent.click(row.closest('button') ?? row);

    await waitFor(() => {
      expect(screen.getByText('Orphan sub-issue')).toBeInTheDocument();
    });
  });

  it('sort by points: rows reorder when points metric is selected', async () => {
    const projectsGateway = new StubTopCycleProjectsGateway({
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
    wire({
      dashboard: buildDashboardWithTeam('team-1', 'Team One'),
      storage,
      projectsGateway,
    });

    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(screen.getAllByTestId('top-cycle-projects-row')).toHaveLength(2);
    });

    fireEvent.click(screen.getByRole('tab', { name: 'Points' }));

    await waitFor(() => {
      const rows = screen.getAllByTestId('top-cycle-projects-row');
      expect(rows[0].textContent).toContain('Beta');
      expect(rows[1].textContent).toContain('Alpha');
    });
  });

  it('sort by time: rows reorder when time metric is selected', async () => {
    const projectsGateway = new StubTopCycleProjectsGateway({
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
            totalCycleTimeInHours: 40,
          },
        ],
      },
    });
    wire({
      dashboard: buildDashboardWithTeam('team-1', 'Team One'),
      storage,
      projectsGateway,
    });

    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(screen.getAllByTestId('top-cycle-projects-row')).toHaveLength(2);
    });

    fireEvent.click(screen.getByRole('tab', { name: 'Time' }));

    await waitFor(() => {
      const rows = screen.getAllByTestId('top-cycle-projects-row');
      expect(rows[0].textContent).toContain('Beta');
      expect(rows[1].textContent).toContain('Alpha');
    });
  });

  it('click row opens drawer listing the project issues', async () => {
    const projectsGateway = new StubTopCycleProjectsGateway({
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
              title: 'First issue',
              assigneeName: 'Alice',
              points: 3,
              statusName: 'Done',
            },
          ],
        },
      },
    });
    wire({
      dashboard: buildDashboardWithTeam('team-1', 'Team One'),
      storage,
      projectsGateway,
    });

    renderAtPath('/dashboard');

    const row = await waitFor(() =>
      screen.getByTestId('top-cycle-projects-row'),
    );
    fireEvent.click(row);

    await waitFor(() => {
      expect(screen.getByText('First issue')).toBeInTheDocument();
    });
    const linearLink = screen.getByRole('link', { name: 'Open in Linear' });
    expect(linearLink.getAttribute('href')).toBe(
      'https://linear.app/issue/LIN-1',
    );
  });

  it('drawer closes on click-outside', async () => {
    const projectsGateway = new StubTopCycleProjectsGateway({
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
              title: 'First issue',
              assigneeName: 'Alice',
              points: 3,
              statusName: 'Done',
            },
          ],
        },
      },
    });
    wire({
      dashboard: buildDashboardWithTeam('team-1', 'Team One'),
      storage,
      projectsGateway,
    });

    renderAtPath('/dashboard');

    const row = await waitFor(() =>
      screen.getByTestId('top-cycle-projects-row'),
    );
    fireEvent.click(row);

    await waitFor(() => {
      expect(screen.getByText('First issue')).toBeInTheDocument();
    });

    const overlay = screen.getByTestId('cycle-insight-drawer-overlay');
    fireEvent.mouseDown(overlay);

    await waitFor(() => {
      expect(screen.queryByText('First issue')).toBeNull();
    });
  });

  it('drawer closes on Escape', async () => {
    const projectsGateway = new StubTopCycleProjectsGateway({
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
              title: 'First issue',
              assigneeName: 'Alice',
              points: 3,
              statusName: 'Done',
            },
          ],
        },
      },
    });
    wire({
      dashboard: buildDashboardWithTeam('team-1', 'Team One'),
      storage,
      projectsGateway,
    });

    renderAtPath('/dashboard');

    const row = await waitFor(() =>
      screen.getByTestId('top-cycle-projects-row'),
    );
    fireEvent.click(row);

    await waitFor(() => {
      expect(screen.getByText('First issue')).toBeInTheDocument();
    });

    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText('First issue')).toBeNull();
    });
  });

  it('no active cycle: card displays the no-active-cycle message', async () => {
    const projectsGateway = new StubTopCycleProjectsGateway({
      ranking: { status: 'no_active_cycle' },
    });
    wire({
      dashboard: buildDashboardWithTeam('team-1', 'Team One'),
      storage,
      projectsGateway,
    });

    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(
        screen.getByText('No active cycle for this team.'),
      ).toBeInTheDocument();
    });
  });

  it('empty cycle: card displays the no-activity message', async () => {
    const projectsGateway = new StubTopCycleProjectsGateway({
      ranking: {
        status: 'ready',
        cycleId: 'cycle-1',
        cycleName: 'Cycle 1',
        projects: [],
      },
    });
    wire({
      dashboard: buildDashboardWithTeam('team-1', 'Team One'),
      storage,
      projectsGateway,
    });

    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(
        screen.getByText('No activity in the current cycle.'),
      ).toBeInTheDocument();
    });
  });

  it('team switch reloads: card shows the new team data', async () => {
    const projectsGateway = new StubTopCycleProjectsGateway({
      rankingByTeamId: {
        'team-alpha': {
          status: 'ready',
          cycleId: 'cycle-alpha',
          cycleName: 'Alpha cycle',
          projects: [
            {
              projectId: 'proj-x',
              projectName: 'ProjX',
              isNoProjectBucket: false,
              issueCount: 2,
              totalPoints: 3,
              totalCycleTimeInHours: 1,
            },
          ],
        },
        'team-bravo': {
          status: 'ready',
          cycleId: 'cycle-bravo',
          cycleName: 'Bravo cycle',
          projects: [
            {
              projectId: 'proj-y',
              projectName: 'ProjY',
              isNoProjectBucket: false,
              issueCount: 1,
              totalPoints: 1,
              totalCycleTimeInHours: 1,
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
    wire({ dashboard, storage, projectsGateway });

    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(screen.getByText('ProjX')).toBeInTheDocument();
    });

    const bravoCard = screen.getByRole('button', { name: /Bravo/ });
    fireEvent.click(bravoCard);

    await waitFor(() => {
      expect(screen.getByText('ProjY')).toBeInTheDocument();
    });
  });

  it('language switch renders French messages', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ language: 'en' }),
      }),
    );
    const projectsGateway = new StubTopCycleProjectsGateway({
      ranking: { status: 'no_active_cycle' },
    });
    wire({
      dashboard: buildDashboardWithTeam('team-1', 'Team One'),
      storage,
      projectsGateway,
    });

    renderWithLocaleProvider('/dashboard');

    await waitFor(() => {
      expect(
        screen.getByText('No active cycle for this team.'),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'switch-to-fr' }));

    await waitFor(() => {
      expect(
        screen.getByText('Pas de cycle actif pour cette equipe.'),
      ).toBeInTheDocument();
    });
  });
});
