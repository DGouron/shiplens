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
import { StubWorkspaceDashboardGateway } from '@/modules/analytics/testing/good-path/stub.workspace-dashboard.in-memory.gateway.ts';
import { GetPersistedTeamSelectionUsecase } from '@/modules/analytics/usecases/get-persisted-team-selection.usecase.ts';
import { GetTopCycleAssigneesUsecase } from '@/modules/analytics/usecases/get-top-cycle-assignees.usecase.ts';
import { GetTopCycleProjectsUsecase } from '@/modules/analytics/usecases/get-top-cycle-projects.usecase.ts';
import { GetWorkspaceDashboardUsecase } from '@/modules/analytics/usecases/get-workspace-dashboard.usecase.ts';
import { ListCycleAssigneeIssuesUsecase } from '@/modules/analytics/usecases/list-cycle-assignee-issues.usecase.ts';
import { ListCycleProjectIssuesUsecase } from '@/modules/analytics/usecases/list-cycle-project-issues.usecase.ts';
import { PersistTeamSelectionUsecase } from '@/modules/analytics/usecases/persist-team-selection.usecase.ts';
import { TeamDashboardResponseBuilder } from '../builders/team-dashboard-response.builder.ts';
import { WorkspaceDashboardResponseBuilder } from '../builders/workspace-dashboard-response.builder.ts';
import { withQueryClient } from '../helpers/query-client-wrapper.tsx';

interface WireParams {
  dashboard: WorkspaceDashboardDataResponse;
  storage: StubTeamSelectionStorageGateway;
  assigneesGateway: StubTopCycleAssigneesGateway;
}

function wire({ dashboard, storage, assigneesGateway }: WireParams): void {
  const projectsGateway = new StubTopCycleProjectsGateway({
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

describe('Show top cycle assignees (acceptance)', () => {
  let storage: StubTeamSelectionStorageGateway;

  beforeEach(() => {
    storage = new StubTeamSelectionStorageGateway();
  });

  afterEach(() => {
    resetUsecases();
    vi.restoreAllMocks();
  });

  it('nominal ranking by count: assignees ordered by issueCount descending', async () => {
    const assigneesGateway = new StubTopCycleAssigneesGateway({
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
          {
            assigneeName: 'Bob',
            issueCount: 3,
            totalPoints: 24,
            totalCycleTimeInHours: 12,
          },
          {
            assigneeName: 'Charlie',
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
      assigneesGateway,
    });

    renderAtPath('/dashboard');

    const rows = await waitFor(() =>
      screen.getAllByTestId('top-cycle-assignees-row'),
    );
    expect(rows.map((row) => row.textContent)).toEqual([
      expect.stringContaining('Alice'),
      expect.stringContaining('Bob'),
      expect.stringContaining('Charlie'),
    ]);
  });

  it('sort by points: rows reorder when points metric is selected', async () => {
    const assigneesGateway = new StubTopCycleAssigneesGateway({
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
    wire({
      dashboard: buildDashboardWithTeam('team-1', 'Team One'),
      storage,
      assigneesGateway,
    });

    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(screen.getAllByTestId('top-cycle-assignees-row')).toHaveLength(2);
    });

    const pointsTabs = screen.getAllByRole('tab', { name: 'Points' });
    fireEvent.click(pointsTabs[pointsTabs.length - 1]);

    await waitFor(() => {
      const rows = screen.getAllByTestId('top-cycle-assignees-row');
      expect(rows[0].textContent).toContain('Bob');
      expect(rows[1].textContent).toContain('Alice');
    });
  });

  it('sort by time: rows reorder when time metric is selected', async () => {
    const assigneesGateway = new StubTopCycleAssigneesGateway({
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
            totalCycleTimeInHours: 40,
          },
        ],
      },
    });
    wire({
      dashboard: buildDashboardWithTeam('team-1', 'Team One'),
      storage,
      assigneesGateway,
    });

    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(screen.getAllByTestId('top-cycle-assignees-row')).toHaveLength(2);
    });

    const timeTabs = screen.getAllByRole('tab', { name: 'Time' });
    fireEvent.click(timeTabs[timeTabs.length - 1]);

    await waitFor(() => {
      const rows = screen.getAllByTestId('top-cycle-assignees-row');
      expect(rows[0].textContent).toContain('Bob');
      expect(rows[1].textContent).toContain('Alice');
    });
  });

  it('fewer than 5 assignees: only available rows are rendered', async () => {
    const assigneesGateway = new StubTopCycleAssigneesGateway({
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
          {
            assigneeName: 'Bob',
            issueCount: 3,
            totalPoints: 24,
            totalCycleTimeInHours: 12,
          },
        ],
      },
    });
    wire({
      dashboard: buildDashboardWithTeam('team-1', 'Team One'),
      storage,
      assigneesGateway,
    });

    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(screen.getAllByTestId('top-cycle-assignees-row')).toHaveLength(2);
    });
  });

  it('no active cycle: card displays the no-active-cycle message', async () => {
    const assigneesGateway = new StubTopCycleAssigneesGateway({
      ranking: { status: 'no_active_cycle' },
    });
    wire({
      dashboard: buildDashboardWithTeam('team-1', 'Team One'),
      storage,
      assigneesGateway,
    });

    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(
        screen.getByText('No active cycle for this team.'),
      ).toBeInTheDocument();
    });
  });

  it('empty cycle: card displays the no-completed-work message', async () => {
    const assigneesGateway = new StubTopCycleAssigneesGateway({
      ranking: {
        status: 'ready',
        cycleId: 'cycle-1',
        cycleName: 'Cycle 1',
        assignees: [],
      },
    });
    wire({
      dashboard: buildDashboardWithTeam('team-1', 'Team One'),
      storage,
      assigneesGateway,
    });

    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(
        screen.getByText('No completed work this cycle.'),
      ).toBeInTheDocument();
    });
  });

  it('click row opens drawer listing the assignee issues with Linear link', async () => {
    const assigneesGateway = new StubTopCycleAssigneesGateway({
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
              externalId: 'LIN-7',
              title: 'Ship the thing',
              points: 3,
              totalCycleTimeInHours: 6,
              statusName: 'Done',
            },
          ],
        },
      },
    });
    wire({
      dashboard: buildDashboardWithTeam('team-1', 'Team One'),
      storage,
      assigneesGateway,
    });

    renderAtPath('/dashboard');

    const row = await waitFor(() =>
      screen.getByTestId('top-cycle-assignees-row'),
    );
    fireEvent.click(row);

    await waitFor(() => {
      expect(screen.getByText('Ship the thing')).toBeInTheDocument();
    });
    const linearLink = screen.getByRole('link', { name: 'Open in Linear' });
    expect(linearLink.getAttribute('href')).toBe(
      'https://linear.app/issue/LIN-7',
    );
  });

  it('drawer closes on Escape', async () => {
    const assigneesGateway = new StubTopCycleAssigneesGateway({
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
              externalId: 'LIN-7',
              title: 'Ship the thing',
              points: 3,
              totalCycleTimeInHours: 6,
              statusName: 'Done',
            },
          ],
        },
      },
    });
    wire({
      dashboard: buildDashboardWithTeam('team-1', 'Team One'),
      storage,
      assigneesGateway,
    });

    renderAtPath('/dashboard');

    const row = await waitFor(() =>
      screen.getByTestId('top-cycle-assignees-row'),
    );
    fireEvent.click(row);

    await waitFor(() => {
      expect(screen.getByText('Ship the thing')).toBeInTheDocument();
    });

    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText('Ship the thing')).toBeNull();
    });
  });

  it('drawer closes on click-outside', async () => {
    const assigneesGateway = new StubTopCycleAssigneesGateway({
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
              externalId: 'LIN-7',
              title: 'Ship the thing',
              points: 3,
              totalCycleTimeInHours: 6,
              statusName: 'Done',
            },
          ],
        },
      },
    });
    wire({
      dashboard: buildDashboardWithTeam('team-1', 'Team One'),
      storage,
      assigneesGateway,
    });

    renderAtPath('/dashboard');

    const row = await waitFor(() =>
      screen.getByTestId('top-cycle-assignees-row'),
    );
    fireEvent.click(row);

    await waitFor(() => {
      expect(screen.getByText('Ship the thing')).toBeInTheDocument();
    });

    const overlays = screen.getAllByTestId('cycle-insight-drawer-overlay');
    fireEvent.mouseDown(overlays[overlays.length - 1]);

    await waitFor(() => {
      expect(screen.queryByText('Ship the thing')).toBeNull();
    });
  });

  it('URL-encodes the assignee name when it contains a space', async () => {
    const assigneesGateway = new StubTopCycleAssigneesGateway({
      ranking: {
        status: 'ready',
        cycleId: 'cycle-1',
        cycleName: 'Cycle 1',
        assignees: [
          {
            assigneeName: 'Mary Jane',
            issueCount: 4,
            totalPoints: 8,
            totalCycleTimeInHours: 12,
          },
        ],
      },
      issuesByAssigneeName: {
        'Mary Jane': {
          status: 'ready',
          cycleId: 'cycle-1',
          assigneeName: 'Mary Jane',
          issues: [
            {
              externalId: 'LIN-22',
              title: 'Compound name task',
              points: 2,
              totalCycleTimeInHours: 3,
              statusName: 'Done',
            },
          ],
        },
      },
    });
    wire({
      dashboard: buildDashboardWithTeam('team-1', 'Team One'),
      storage,
      assigneesGateway,
    });

    renderAtPath('/dashboard');

    const row = await waitFor(() =>
      screen.getByTestId('top-cycle-assignees-row'),
    );
    fireEvent.click(row);

    await waitFor(() => {
      expect(screen.getByText('Compound name task')).toBeInTheDocument();
    });
    expect(assigneesGateway.lastIssuesCall).toEqual({
      teamId: 'team-1',
      assigneeName: 'Mary Jane',
    });
  });

  it('team switch reloads: card shows the new team data', async () => {
    const assigneesGateway = new StubTopCycleAssigneesGateway({
      rankingByTeamId: {
        'team-alpha': {
          status: 'ready',
          cycleId: 'cycle-alpha',
          cycleName: 'Alpha cycle',
          assignees: [
            {
              assigneeName: 'Alice',
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
    wire({ dashboard, storage, assigneesGateway });

    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    const bravoCard = screen.getByRole('button', { name: /Bravo/ });
    fireEvent.click(bravoCard);

    await waitFor(() => {
      expect(screen.getByText('Zara')).toBeInTheDocument();
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
    const assigneesGateway = new StubTopCycleAssigneesGateway({
      ranking: { status: 'no_active_cycle' },
    });
    wire({
      dashboard: buildDashboardWithTeam('team-1', 'Team One'),
      storage,
      assigneesGateway,
    });

    renderWithLocaleProvider('/dashboard');

    await waitFor(() => {
      expect(
        screen.getAllByText('No active cycle for this team.').length,
      ).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByRole('button', { name: 'switch-to-fr' }));

    await waitFor(() => {
      expect(
        screen.getAllByText('Pas de cycle actif pour cette equipe.').length,
      ).toBeGreaterThan(0);
    });
  });
});
