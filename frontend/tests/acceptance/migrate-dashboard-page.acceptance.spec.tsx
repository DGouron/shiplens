import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, Navigate, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '@/app.tsx';
import { LocaleProvider } from '@/locale-context.tsx';
import { overrideUsecases, resetUsecases } from '@/main/dependencies.ts';
import { DashboardView } from '@/modules/analytics/interface-adapters/views/dashboard.view.tsx';
import { FailingWorkspaceDashboardGateway } from '@/modules/analytics/testing/bad-path/failing.workspace-dashboard.in-memory.gateway.ts';
import { StubEmptyWorkspaceDashboardGateway } from '@/modules/analytics/testing/good-path/stub.empty-workspace-dashboard.in-memory.gateway.ts';
import { StubWorkspaceDashboardGateway } from '@/modules/analytics/testing/good-path/stub.workspace-dashboard.in-memory.gateway.ts';
import { GetWorkspaceDashboardUsecase } from '@/modules/analytics/usecases/get-workspace-dashboard.usecase.ts';
import { FailingSyncGateway } from '@/modules/synchronization/testing/bad-path/failing.sync.in-memory.gateway.ts';
import { StubSyncGateway } from '@/modules/synchronization/testing/good-path/stub.sync.in-memory.gateway.ts';
import { DiscoverSyncTeamsUsecase } from '@/modules/synchronization/usecases/discover-sync-teams.usecase.ts';
import { GetSyncSelectionUsecase } from '@/modules/synchronization/usecases/get-sync-selection.usecase.ts';
import { SelectAllSyncTargetsUsecase } from '@/modules/synchronization/usecases/select-all-sync-targets.usecase.ts';
import { SyncReferenceDataUsecase } from '@/modules/synchronization/usecases/sync-reference-data.usecase.ts';
import { SyncTeamIssuesUsecase } from '@/modules/synchronization/usecases/sync-team-issues.usecase.ts';
import { SynchronizationResponseBuilder } from '../builders/synchronization-response.builder.ts';
import { TeamDashboardResponseBuilder } from '../builders/team-dashboard-response.builder.ts';
import { WorkspaceDashboardResponseBuilder } from '../builders/workspace-dashboard-response.builder.ts';
import { withQueryClient } from '../helpers/query-client-wrapper.tsx';

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

function renderAtPathWithLocaleProvider(initialPath: string) {
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
        <RouterProvider router={router} />
      </LocaleProvider>,
    ),
  );
}

describe('Migrate dashboard page (acceptance)', () => {
  afterEach(() => {
    resetUsecases();
    vi.restoreAllMocks();
  });

  it('dashboard route renders: navigating to /dashboard shows the Dashboard page heading', async () => {
    const dto = new WorkspaceDashboardResponseBuilder().build();
    overrideUsecases({
      getWorkspaceDashboard: new GetWorkspaceDashboardUsecase(
        new StubWorkspaceDashboardGateway({ response: dto }),
      ),
    });

    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'Dashboard' }),
      ).toBeInTheDocument();
    });
  });

  it('nominal dashboard renders 3 team cards', async () => {
    const dto = new WorkspaceDashboardResponseBuilder()
      .withTeams([
        new TeamDashboardResponseBuilder()
          .withTeamId('team-1')
          .withTeamName('Alpha')
          .withCompletionRate('75%')
          .build(),
        new TeamDashboardResponseBuilder()
          .withTeamId('team-2')
          .withTeamName('Bravo')
          .withCompletionRate('45%')
          .build(),
        new TeamDashboardResponseBuilder()
          .withTeamId('team-3')
          .withTeamName('Charlie')
          .withCompletionRate('20%')
          .build(),
      ])
      .build();
    overrideUsecases({
      getWorkspaceDashboard: new GetWorkspaceDashboardUsecase(
        new StubWorkspaceDashboardGateway({ response: dto }),
      ),
    });

    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeInTheDocument();
    });
    expect(screen.getByText('Bravo')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  it('empty state not_connected shows the guidance message', async () => {
    overrideUsecases({
      getWorkspaceDashboard: new GetWorkspaceDashboardUsecase(
        new StubEmptyWorkspaceDashboardGateway({
          status: 'not_connected',
          message: 'Connect your workspace',
        }),
      ),
    });

    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(screen.getByText('Connect your workspace')).toBeInTheDocument();
    });
  });

  it('empty state no_teams shows the guidance message', async () => {
    overrideUsecases({
      getWorkspaceDashboard: new GetWorkspaceDashboardUsecase(
        new StubEmptyWorkspaceDashboardGateway({
          status: 'no_teams',
          message: 'No teams yet, synchronize now',
        }),
      ),
    });

    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(
        screen.getByText('No teams yet, synchronize now'),
      ).toBeInTheDocument();
    });
  });

  it('error state shows the error message', async () => {
    overrideUsecases({
      getWorkspaceDashboard: new GetWorkspaceDashboardUsecase(
        new FailingWorkspaceDashboardGateway(),
      ),
    });

    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch dashboard')).toBeInTheDocument();
    });
  });

  it('team without active cycle shows idle card with No active cycle message', async () => {
    const dto = new WorkspaceDashboardResponseBuilder()
      .withTeams([
        new TeamDashboardResponseBuilder()
          .withTeamId('team-idle')
          .withTeamName('Sleepers')
          .withoutActiveCycle()
          .build(),
      ])
      .build();
    overrideUsecases({
      getWorkspaceDashboard: new GetWorkspaceDashboardUsecase(
        new StubWorkspaceDashboardGateway({ response: dto }),
      ),
    });

    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(screen.getByText('Sleepers')).toBeInTheDocument();
    });
    expect(screen.getByText('Aucun cycle actif')).toBeInTheDocument();
  });

  it('healthy team has green ring stroke color', async () => {
    const dto = new WorkspaceDashboardResponseBuilder()
      .withTeams([
        new TeamDashboardResponseBuilder()
          .withTeamName('Healthy Team')
          .withCompletionRate('75%')
          .withBlockedAlert(false)
          .build(),
      ])
      .build();
    overrideUsecases({
      getWorkspaceDashboard: new GetWorkspaceDashboardUsecase(
        new StubWorkspaceDashboardGateway({ response: dto }),
      ),
    });

    const { container } = renderAtPath('/dashboard');

    await waitFor(() => {
      expect(screen.getByText('Healthy Team')).toBeInTheDocument();
    });
    const ringForeground = container.querySelector('circle.ring-fg');
    expect(ringForeground).not.toBeNull();
    expect(ringForeground?.getAttribute('stroke')).toBe('var(--success)');
  });

  it('sync status late shows the late warning from the translations', async () => {
    const dto = new WorkspaceDashboardResponseBuilder()
      .withSynchronization(
        new SynchronizationResponseBuilder().withIsLate(true).build(),
      )
      .build();
    overrideUsecases({
      getWorkspaceDashboard: new GetWorkspaceDashboardUsecase(
        new StubWorkspaceDashboardGateway({ response: dto }),
      ),
    });

    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(screen.getByText('Last sync is late')).toBeInTheDocument();
    });
  });

  it('never synced shows the Never synced label', async () => {
    const dto = new WorkspaceDashboardResponseBuilder()
      .withSynchronization(
        new SynchronizationResponseBuilder().withLastSyncDate(null).build(),
      )
      .build();
    overrideUsecases({
      getWorkspaceDashboard: new GetWorkspaceDashboardUsecase(
        new StubWorkspaceDashboardGateway({ response: dto }),
      ),
    });

    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(screen.getByText('Never synced')).toBeInTheDocument();
    });
  });

  it('locale fr: renders French labels', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ language: 'fr' }),
      }),
    );
    const dto = new WorkspaceDashboardResponseBuilder().build();
    overrideUsecases({
      getWorkspaceDashboard: new GetWorkspaceDashboardUsecase(
        new StubWorkspaceDashboardGateway({ response: dto }),
      ),
    });

    renderAtPathWithLocaleProvider('/dashboard');

    await waitFor(() => {
      expect(screen.getByText('Voir le rapport')).toBeInTheDocument();
    });
  });

  it('auto sync succeeds: reloads the dashboard once sync completes', async () => {
    const dashboardGateway = new StubWorkspaceDashboardGateway();
    const successResponse = new WorkspaceDashboardResponseBuilder()
      .withTeams([
        new TeamDashboardResponseBuilder().withTeamName('Synced Team').build(),
      ])
      .build();
    let dashboardCallCount = 0;
    dashboardGateway.fetchDashboard = async () => {
      dashboardCallCount += 1;
      return dashboardCallCount === 1
        ? { status: 'no_teams', message: 'No teams yet' }
        : successResponse;
    };
    const syncStub = new StubSyncGateway();
    overrideUsecases({
      getWorkspaceDashboard: new GetWorkspaceDashboardUsecase(dashboardGateway),
      discoverSyncTeams: new DiscoverSyncTeamsUsecase(syncStub),
      selectAllSyncTargets: new SelectAllSyncTargetsUsecase(syncStub),
      syncReferenceData: new SyncReferenceDataUsecase(syncStub),
      syncTeamIssues: new SyncTeamIssuesUsecase(syncStub),
      getSyncSelection: new GetSyncSelectionUsecase(syncStub),
    });

    renderAtPath('/dashboard');

    await waitFor(
      () => {
        expect(screen.getByText('Synced Team')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(syncStub.referenceDataSyncCount).toBeGreaterThan(0);
  });

  it('auto sync exhausts retries: shows error with retry button enabled', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    overrideUsecases({
      getWorkspaceDashboard: new GetWorkspaceDashboardUsecase(
        new StubEmptyWorkspaceDashboardGateway({
          status: 'no_teams',
          message: 'No teams yet',
        }),
      ),
      discoverSyncTeams: new DiscoverSyncTeamsUsecase(new FailingSyncGateway()),
      selectAllSyncTargets: new SelectAllSyncTargetsUsecase(
        new FailingSyncGateway(),
      ),
      syncReferenceData: new SyncReferenceDataUsecase(new FailingSyncGateway()),
      syncTeamIssues: new SyncTeamIssuesUsecase(new FailingSyncGateway()),
      getSyncSelection: new GetSyncSelectionUsecase(new FailingSyncGateway()),
    });

    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(screen.getByText('No teams yet')).toBeInTheDocument();
    });
    await vi.advanceTimersByTimeAsync(10_000);
    vi.useRealTimers();

    await waitFor(
      () => {
        expect(
          screen.getByRole('button', { name: 'Retry' }),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('manual resync triggers the sync flow and reloads', async () => {
    const dashboardGateway = new StubWorkspaceDashboardGateway();
    const syncStub = new StubSyncGateway();
    overrideUsecases({
      getWorkspaceDashboard: new GetWorkspaceDashboardUsecase(dashboardGateway),
      discoverSyncTeams: new DiscoverSyncTeamsUsecase(syncStub),
      selectAllSyncTargets: new SelectAllSyncTargetsUsecase(syncStub),
      syncReferenceData: new SyncReferenceDataUsecase(syncStub),
      syncTeamIssues: new SyncTeamIssuesUsecase(syncStub),
      getSyncSelection: new GetSyncSelectionUsecase(syncStub),
    });

    renderAtPath('/dashboard');

    const resyncButton = await screen.findByRole('button', {
      name: 'Resynchronize',
    });
    fireEvent.click(resyncButton);

    await waitFor(() => {
      expect(syncStub.referenceDataSyncCount).toBeGreaterThan(0);
    });
    expect(syncStub.teamIssuesSyncedFor.length).toBeGreaterThan(0);
  });

  it('redirect from / to /dashboard renders the dashboard', async () => {
    const dashboardGateway = new StubWorkspaceDashboardGateway();
    overrideUsecases({
      getWorkspaceDashboard: new GetWorkspaceDashboardUsecase(dashboardGateway),
    });

    renderAtPath('/');

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'Dashboard' }),
      ).toBeInTheDocument();
    });
  });
});
