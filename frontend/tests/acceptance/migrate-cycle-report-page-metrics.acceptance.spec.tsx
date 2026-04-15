import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from '@/app.tsx';
import { overrideUsecases, resetUsecases } from '@/main/dependencies.ts';
import { CycleReportView } from '@/modules/analytics/interface-adapters/views/cycle-report/cycle-report.view.tsx';
import { FailingCycleMetricsGateway } from '@/modules/analytics/testing/bad-path/failing.cycle-metrics.in-memory.gateway.ts';
import { StubCycleMetricsGateway } from '@/modules/analytics/testing/good-path/stub.cycle-metrics.in-memory.gateway.ts';
import { StubTeamCyclesGateway } from '@/modules/analytics/testing/good-path/stub.team-cycles.in-memory.gateway.ts';
import { GetCycleMetricsUsecase } from '@/modules/analytics/usecases/get-cycle-metrics.usecase.ts';
import { ListAvailableTeamsUsecase } from '@/modules/analytics/usecases/list-available-teams.usecase.ts';
import { ListTeamCyclesUsecase } from '@/modules/analytics/usecases/list-team-cycles.usecase.ts';
import { StubSyncGateway } from '@/modules/synchronization/testing/good-path/stub.sync.in-memory.gateway.ts';
import { CycleMetricsResponseBuilder } from '../builders/cycle-metrics-response.builder.ts';
import { CycleSummaryResponseBuilder } from '../builders/cycle-summary-response.builder.ts';
import { SyncAvailableTeamResponseBuilder } from '../builders/sync-available-team-response.builder.ts';
import { TeamCyclesResponseBuilder } from '../builders/team-cycles-response.builder.ts';
import { withQueryClient } from '../helpers/query-client-wrapper.tsx';

function renderAtPath(initialPath: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <App />,
        children: [{ path: 'cycle-report', element: <CycleReportView /> }],
      },
    ],
    { initialEntries: [initialPath] },
  );

  return render(withQueryClient(<RouterProvider router={router} />));
}

function stubShellWithCycles(cycleIds: string[]) {
  const syncGateway = new StubSyncGateway({
    availableTeams: [
      new SyncAvailableTeamResponseBuilder()
        .withTeamId('team-1')
        .withTeamName('Alpha')
        .build(),
    ],
  });
  const cyclesGateway = new StubTeamCyclesGateway({
    response: new TeamCyclesResponseBuilder()
      .withCycles(
        cycleIds.map((externalId) =>
          new CycleSummaryResponseBuilder()
            .withExternalId(externalId)
            .withName(`Cycle ${externalId}`)
            .build(),
        ),
      )
      .build(),
  });
  return { syncGateway, cyclesGateway };
}

describe('Migrate cycle report page metrics (acceptance)', () => {
  afterEach(() => {
    resetUsecases();
  });

  it('renders the 6 KPI cards with formatted values when a team and cycle are selected', async () => {
    const { syncGateway, cyclesGateway } = stubShellWithCycles(['cycle-1']);
    const metricsGateway = new StubCycleMetricsGateway({
      response: new CycleMetricsResponseBuilder()
        .withVelocity({ completedPoints: 8, plannedPoints: 12 })
        .withThroughput(15)
        .withCompletionRate(75)
        .withScopeCreep(4)
        .withAverageCycleTimeInDays(2.56)
        .withAverageLeadTimeInDays(7)
        .build(),
    });
    overrideUsecases({
      listAvailableTeams: new ListAvailableTeamsUsecase(syncGateway),
      listTeamCycles: new ListTeamCyclesUsecase(cyclesGateway),
      getCycleMetrics: new GetCycleMetricsUsecase(metricsGateway),
    });

    renderAtPath('/cycle-report?teamId=team-1&cycleId=cycle-1');

    await waitFor(() => {
      expect(screen.getByText('8/12 points')).toBeInTheDocument();
    });
    expect(screen.getByText('15 issues')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('4 issues added')).toBeInTheDocument();
    expect(screen.getByText('2.6 days')).toBeInTheDocument();
    expect(screen.getByText('7 days')).toBeInTheDocument();
  });

  it('marks the scope-creep card as alert when scopeCreep exceeds 30 issues', async () => {
    const { syncGateway, cyclesGateway } = stubShellWithCycles(['cycle-1']);
    const metricsGateway = new StubCycleMetricsGateway({
      response: new CycleMetricsResponseBuilder().withScopeCreep(31).build(),
    });
    overrideUsecases({
      listAvailableTeams: new ListAvailableTeamsUsecase(syncGateway),
      listTeamCycles: new ListTeamCyclesUsecase(cyclesGateway),
      getCycleMetrics: new GetCycleMetricsUsecase(metricsGateway),
    });

    renderAtPath('/cycle-report?teamId=team-1&cycleId=cycle-1');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('31 issues added');
  });

  it('does NOT mark the scope-creep card as alert when scopeCreep equals 30', async () => {
    const { syncGateway, cyclesGateway } = stubShellWithCycles(['cycle-1']);
    const metricsGateway = new StubCycleMetricsGateway({
      response: new CycleMetricsResponseBuilder().withScopeCreep(30).build(),
    });
    overrideUsecases({
      listAvailableTeams: new ListAvailableTeamsUsecase(syncGateway),
      listTeamCycles: new ListTeamCyclesUsecase(cyclesGateway),
      getCycleMetrics: new GetCycleMetricsUsecase(metricsGateway),
    });

    renderAtPath('/cycle-report?teamId=team-1&cycleId=cycle-1');

    await waitFor(() => {
      expect(screen.getByText('30 issues added')).toBeInTheDocument();
    });
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('renders zero values for a cycle with no issues', async () => {
    const { syncGateway, cyclesGateway } = stubShellWithCycles(['cycle-1']);
    const metricsGateway = new StubCycleMetricsGateway({
      response: new CycleMetricsResponseBuilder()
        .withVelocity({ completedPoints: 0, plannedPoints: 0 })
        .withThroughput(0)
        .withCompletionRate(0)
        .withScopeCreep(0)
        .withAverageCycleTimeInDays(null)
        .withAverageLeadTimeInDays(null)
        .build(),
    });
    overrideUsecases({
      listAvailableTeams: new ListAvailableTeamsUsecase(syncGateway),
      listTeamCycles: new ListTeamCyclesUsecase(cyclesGateway),
      getCycleMetrics: new GetCycleMetricsUsecase(metricsGateway),
    });

    renderAtPath('/cycle-report?teamId=team-1&cycleId=cycle-1');

    await waitFor(() => {
      expect(screen.getByText('0/0 points')).toBeInTheDocument();
    });
    expect(screen.getByText('0 issues')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('0 issues added')).toBeInTheDocument();
    expect(screen.getAllByText('Not available')).toHaveLength(2);
  });

  it('shows a section-level skeleton while metrics are loading, other 5 sections stay placeholders', async () => {
    const { syncGateway, cyclesGateway } = stubShellWithCycles(['cycle-1']);
    const neverResolvingMetricsGateway = new StubCycleMetricsGateway();
    const originalFetch = neverResolvingMetricsGateway.fetchCycleMetrics.bind(
      neverResolvingMetricsGateway,
    );
    neverResolvingMetricsGateway.fetchCycleMetrics = () =>
      new Promise(() => {
        void originalFetch;
      });
    overrideUsecases({
      listAvailableTeams: new ListAvailableTeamsUsecase(syncGateway),
      listTeamCycles: new ListTeamCyclesUsecase(cyclesGateway),
      getCycleMetrics: new GetCycleMetricsUsecase(neverResolvingMetricsGateway),
    });

    renderAtPath('/cycle-report?teamId=team-1&cycleId=cycle-1');

    await waitFor(() => {
      expect(
        document.querySelector('[data-section-id="metrics"]'),
      ).not.toBeNull();
    });
    expect(
      document.querySelector('[data-section-id="bottlenecks"]'),
    ).not.toBeNull();
    expect(
      document.querySelector('[data-section-id="blocked"]'),
    ).not.toBeNull();
    expect(
      document.querySelector('[data-section-id="estimation"]'),
    ).not.toBeNull();
    expect(
      document.querySelector('[data-section-id="drifting"]'),
    ).not.toBeNull();
    expect(
      document.querySelector('[data-section-id="ai-report"]'),
    ).not.toBeNull();
  });

  it('shows a section-level error when the metrics endpoint fails, other 5 sections stay placeholders', async () => {
    const { syncGateway, cyclesGateway } = stubShellWithCycles(['cycle-1']);
    overrideUsecases({
      listAvailableTeams: new ListAvailableTeamsUsecase(syncGateway),
      listTeamCycles: new ListTeamCyclesUsecase(cyclesGateway),
      getCycleMetrics: new GetCycleMetricsUsecase(
        new FailingCycleMetricsGateway(),
      ),
    });

    renderAtPath('/cycle-report?teamId=team-1&cycleId=cycle-1');

    await waitFor(() => {
      expect(
        screen.getByText('Failed to fetch cycle metrics'),
      ).toBeInTheDocument();
    });
    expect(screen.getByText('Bottlenecks')).toBeInTheDocument();
    expect(screen.getByText('Blocked issues')).toBeInTheDocument();
    expect(screen.getByText('Estimation accuracy')).toBeInTheDocument();
    expect(screen.getByText('Drifting issues')).toBeInTheDocument();
    expect(screen.getByText('AI report')).toBeInTheDocument();
  });

  it('auto-selects the most-recent cycle on team change and fetches its metrics', async () => {
    const { syncGateway } = stubShellWithCycles([]);
    const cyclesGateway = new StubTeamCyclesGateway({
      response: new TeamCyclesResponseBuilder()
        .withCycles([
          new CycleSummaryResponseBuilder()
            .withExternalId('cycle-most-recent')
            .withName('Cycle most recent')
            .build(),
          new CycleSummaryResponseBuilder()
            .withExternalId('cycle-older')
            .withName('Cycle older')
            .build(),
        ])
        .build(),
    });
    const metricsGateway = new StubCycleMetricsGateway({
      response: new CycleMetricsResponseBuilder().withThroughput(42).build(),
    });
    overrideUsecases({
      listAvailableTeams: new ListAvailableTeamsUsecase(syncGateway),
      listTeamCycles: new ListTeamCyclesUsecase(cyclesGateway),
      getCycleMetrics: new GetCycleMetricsUsecase(metricsGateway),
    });

    renderAtPath('/cycle-report?teamId=team-1');

    await waitFor(() => {
      expect(screen.getByText('42 issues')).toBeInTheDocument();
    });
    expect(metricsGateway.calls).toEqual([
      { teamId: 'team-1', cycleId: 'cycle-most-recent' },
    ]);
  });

  it('does not attempt to fetch when the URL has no cycleId', async () => {
    const { syncGateway } = stubShellWithCycles([]);
    const cyclesGateway = new StubTeamCyclesGateway({
      response: new TeamCyclesResponseBuilder().withCycles([]).build(),
    });
    const metricsGateway = new StubCycleMetricsGateway();
    overrideUsecases({
      listAvailableTeams: new ListAvailableTeamsUsecase(syncGateway),
      listTeamCycles: new ListTeamCyclesUsecase(cyclesGateway),
      getCycleMetrics: new GetCycleMetricsUsecase(metricsGateway),
    });

    renderAtPath('/cycle-report?teamId=team-1');

    await waitFor(() => {
      expect(screen.getByText('Metrics')).toBeInTheDocument();
    });
    expect(metricsGateway.calls).toEqual([]);
  });
});
