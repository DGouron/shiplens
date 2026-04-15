import { render, screen, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from '@/app.tsx';
import { overrideUsecases, resetUsecases } from '@/main/dependencies.ts';
import { CycleReportView } from '@/modules/analytics/interface-adapters/views/cycle-report/cycle-report.view.tsx';
import { FailingBlockedIssuesGateway } from '@/modules/analytics/testing/bad-path/failing.blocked-issues.in-memory.gateway.ts';
import { FailingBottleneckAnalysisGateway } from '@/modules/analytics/testing/bad-path/failing.bottleneck-analysis.in-memory.gateway.ts';
import { StubBlockedIssuesGateway } from '@/modules/analytics/testing/good-path/stub.blocked-issues.in-memory.gateway.ts';
import { StubBottleneckAnalysisGateway } from '@/modules/analytics/testing/good-path/stub.bottleneck-analysis.in-memory.gateway.ts';
import { StubCycleMetricsGateway } from '@/modules/analytics/testing/good-path/stub.cycle-metrics.in-memory.gateway.ts';
import { StubTeamCyclesGateway } from '@/modules/analytics/testing/good-path/stub.team-cycles.in-memory.gateway.ts';
import { GetBottleneckAnalysisUsecase } from '@/modules/analytics/usecases/get-bottleneck-analysis.usecase.ts';
import { GetCycleMetricsUsecase } from '@/modules/analytics/usecases/get-cycle-metrics.usecase.ts';
import { ListAvailableTeamsUsecase } from '@/modules/analytics/usecases/list-available-teams.usecase.ts';
import { ListBlockedIssuesUsecase } from '@/modules/analytics/usecases/list-blocked-issues.usecase.ts';
import { ListTeamCyclesUsecase } from '@/modules/analytics/usecases/list-team-cycles.usecase.ts';
import { StubSyncGateway } from '@/modules/synchronization/testing/good-path/stub.sync.in-memory.gateway.ts';
import { BlockedIssueAlertResponseBuilder } from '../builders/blocked-issue-alert-response.builder.ts';
import { BottleneckAnalysisResponseBuilder } from '../builders/bottleneck-analysis-response.builder.ts';
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

describe('Migrate cycle report page bottlenecks and blocked (acceptance)', () => {
  afterEach(() => {
    resetUsecases();
  });

  it('renders the bottleneck table sorted by median hours descending', async () => {
    const { syncGateway, cyclesGateway } = stubShellWithCycles(['cycle-1']);
    const bottleneckGateway = new StubBottleneckAnalysisGateway({
      response: new BottleneckAnalysisResponseBuilder()
        .withStatusDistribution([
          { statusName: 'Todo', medianHours: 3 },
          { statusName: 'In Review', medianHours: 48 },
          { statusName: 'In Progress', medianHours: 12 },
        ])
        .withBottleneckStatus('In Review')
        .build(),
    });
    overrideUsecases({
      listAvailableTeams: new ListAvailableTeamsUsecase(syncGateway),
      listTeamCycles: new ListTeamCyclesUsecase(cyclesGateway),
      getCycleMetrics: new GetCycleMetricsUsecase(
        new StubCycleMetricsGateway(),
      ),
      getBottleneckAnalysis: new GetBottleneckAnalysisUsecase(
        bottleneckGateway,
      ),
      listBlockedIssues: new ListBlockedIssuesUsecase(
        new StubBlockedIssuesGateway(),
      ),
    });

    renderAtPath('/cycle-report?teamId=team-1&cycleId=cycle-1');

    const bottleneckSection = await waitFor(() => {
      const section = document.querySelector<HTMLElement>(
        '[data-section-id="bottlenecks"]',
      );
      if (!section) throw new Error('Bottleneck section not found yet');
      return section;
    });
    await waitFor(() => {
      expect(
        within(bottleneckSection).getByText('In Review'),
      ).toBeInTheDocument();
    });
    const rowCells = within(bottleneckSection)
      .getAllByRole('row')
      .slice(1)
      .map((row) => row.querySelector('td')?.textContent);
    expect(rowCells).toEqual(['In Review', 'In Progress', 'Todo']);
  });

  it('highlights the bottleneck row when statusName matches bottleneckStatus', async () => {
    const { syncGateway, cyclesGateway } = stubShellWithCycles(['cycle-1']);
    const bottleneckGateway = new StubBottleneckAnalysisGateway({
      response: new BottleneckAnalysisResponseBuilder()
        .withStatusDistribution([
          { statusName: 'In Progress', medianHours: 12 },
          { statusName: 'In Review', medianHours: 48 },
        ])
        .withBottleneckStatus('In Review')
        .build(),
    });
    overrideUsecases({
      listAvailableTeams: new ListAvailableTeamsUsecase(syncGateway),
      listTeamCycles: new ListTeamCyclesUsecase(cyclesGateway),
      getCycleMetrics: new GetCycleMetricsUsecase(
        new StubCycleMetricsGateway(),
      ),
      getBottleneckAnalysis: new GetBottleneckAnalysisUsecase(
        bottleneckGateway,
      ),
      listBlockedIssues: new ListBlockedIssuesUsecase(
        new StubBlockedIssuesGateway(),
      ),
    });

    renderAtPath('/cycle-report?teamId=team-1&cycleId=cycle-1');

    const highlightedRow = await screen.findByRole('row', {
      name: 'Bottleneck status',
    });
    expect(within(highlightedRow).getByText('In Review')).toBeInTheDocument();
  });

  it('shows a section-level skeleton while bottlenecks load', async () => {
    const { syncGateway, cyclesGateway } = stubShellWithCycles(['cycle-1']);
    const pendingBottleneckGateway = new StubBottleneckAnalysisGateway();
    pendingBottleneckGateway.fetchBottleneckAnalysis = () =>
      new Promise(() => {});
    overrideUsecases({
      listAvailableTeams: new ListAvailableTeamsUsecase(syncGateway),
      listTeamCycles: new ListTeamCyclesUsecase(cyclesGateway),
      getCycleMetrics: new GetCycleMetricsUsecase(
        new StubCycleMetricsGateway(),
      ),
      getBottleneckAnalysis: new GetBottleneckAnalysisUsecase(
        pendingBottleneckGateway,
      ),
      listBlockedIssues: new ListBlockedIssuesUsecase(
        new StubBlockedIssuesGateway(),
      ),
    });

    renderAtPath('/cycle-report?teamId=team-1&cycleId=cycle-1');

    await waitFor(() => {
      const section = document.querySelector('[data-section-id="bottlenecks"]');
      expect(section?.querySelector('.skeleton-card')).not.toBeNull();
    });
  });

  it('shows a section-level error when the bottlenecks endpoint fails', async () => {
    const { syncGateway, cyclesGateway } = stubShellWithCycles(['cycle-1']);
    overrideUsecases({
      listAvailableTeams: new ListAvailableTeamsUsecase(syncGateway),
      listTeamCycles: new ListTeamCyclesUsecase(cyclesGateway),
      getCycleMetrics: new GetCycleMetricsUsecase(
        new StubCycleMetricsGateway(),
      ),
      getBottleneckAnalysis: new GetBottleneckAnalysisUsecase(
        new FailingBottleneckAnalysisGateway(),
      ),
      listBlockedIssues: new ListBlockedIssuesUsecase(
        new StubBlockedIssuesGateway(),
      ),
    });

    renderAtPath('/cycle-report?teamId=team-1&cycleId=cycle-1');

    await waitFor(() => {
      expect(
        screen.getByText('Failed to fetch bottleneck analysis'),
      ).toBeInTheDocument();
    });
  });

  it('shows an empty message when a cycle has no tracked statuses', async () => {
    const { syncGateway, cyclesGateway } = stubShellWithCycles(['cycle-1']);
    const bottleneckGateway = new StubBottleneckAnalysisGateway({
      response: new BottleneckAnalysisResponseBuilder()
        .withStatusDistribution([])
        .withBottleneckStatus('')
        .build(),
    });
    overrideUsecases({
      listAvailableTeams: new ListAvailableTeamsUsecase(syncGateway),
      listTeamCycles: new ListTeamCyclesUsecase(cyclesGateway),
      getCycleMetrics: new GetCycleMetricsUsecase(
        new StubCycleMetricsGateway(),
      ),
      getBottleneckAnalysis: new GetBottleneckAnalysisUsecase(
        bottleneckGateway,
      ),
      listBlockedIssues: new ListBlockedIssuesUsecase(
        new StubBlockedIssuesGateway(),
      ),
    });

    renderAtPath('/cycle-report?teamId=team-1&cycleId=cycle-1');

    await waitFor(() => {
      expect(
        screen.getByText('No tracked statuses for this cycle'),
      ).toBeInTheDocument();
    });
  });

  it('renders blocked issues filtered by the selected team', async () => {
    const { syncGateway, cyclesGateway } = stubShellWithCycles(['cycle-1']);
    const blockedIssuesGateway = new StubBlockedIssuesGateway({
      response: [
        new BlockedIssueAlertResponseBuilder()
          .withId('alert-matching')
          .withIssueTitle('Critical story for Alpha')
          .withTeamId('team-1')
          .build(),
        new BlockedIssueAlertResponseBuilder()
          .withId('alert-other')
          .withIssueTitle('Issue for Beta team')
          .withTeamId('team-other')
          .build(),
      ],
    });
    overrideUsecases({
      listAvailableTeams: new ListAvailableTeamsUsecase(syncGateway),
      listTeamCycles: new ListTeamCyclesUsecase(cyclesGateway),
      getCycleMetrics: new GetCycleMetricsUsecase(
        new StubCycleMetricsGateway(),
      ),
      getBottleneckAnalysis: new GetBottleneckAnalysisUsecase(
        new StubBottleneckAnalysisGateway(),
      ),
      listBlockedIssues: new ListBlockedIssuesUsecase(blockedIssuesGateway),
    });

    renderAtPath('/cycle-report?teamId=team-1&cycleId=cycle-1');

    await waitFor(() => {
      expect(screen.getByText('Critical story for Alpha')).toBeInTheDocument();
    });
    expect(screen.queryByText('Issue for Beta team')).toBeNull();
  });

  it('shows an empty message when the selected team has no blocked issues', async () => {
    const { syncGateway, cyclesGateway } = stubShellWithCycles(['cycle-1']);
    const blockedIssuesGateway = new StubBlockedIssuesGateway({
      response: [
        new BlockedIssueAlertResponseBuilder()
          .withId('alert-other')
          .withTeamId('team-other')
          .build(),
      ],
    });
    overrideUsecases({
      listAvailableTeams: new ListAvailableTeamsUsecase(syncGateway),
      listTeamCycles: new ListTeamCyclesUsecase(cyclesGateway),
      getCycleMetrics: new GetCycleMetricsUsecase(
        new StubCycleMetricsGateway(),
      ),
      getBottleneckAnalysis: new GetBottleneckAnalysisUsecase(
        new StubBottleneckAnalysisGateway(),
      ),
      listBlockedIssues: new ListBlockedIssuesUsecase(blockedIssuesGateway),
    });

    renderAtPath('/cycle-report?teamId=team-1&cycleId=cycle-1');

    await waitFor(() => {
      expect(
        screen.getByText('No blocked issues for this team'),
      ).toBeInTheDocument();
    });
  });

  it('loads blocked issues even when no cycle is selected', async () => {
    const syncGateway = new StubSyncGateway({
      availableTeams: [
        new SyncAvailableTeamResponseBuilder()
          .withTeamId('team-1')
          .withTeamName('Alpha')
          .build(),
      ],
    });
    const cyclesGateway = new StubTeamCyclesGateway({
      response: new TeamCyclesResponseBuilder().withCycles([]).build(),
    });
    const blockedIssuesGateway = new StubBlockedIssuesGateway({
      response: [
        new BlockedIssueAlertResponseBuilder()
          .withId('alert-1')
          .withIssueTitle('Blocked without cycle')
          .withTeamId('team-1')
          .build(),
      ],
    });
    overrideUsecases({
      listAvailableTeams: new ListAvailableTeamsUsecase(syncGateway),
      listTeamCycles: new ListTeamCyclesUsecase(cyclesGateway),
      getCycleMetrics: new GetCycleMetricsUsecase(
        new StubCycleMetricsGateway(),
      ),
      getBottleneckAnalysis: new GetBottleneckAnalysisUsecase(
        new StubBottleneckAnalysisGateway(),
      ),
      listBlockedIssues: new ListBlockedIssuesUsecase(blockedIssuesGateway),
    });

    renderAtPath('/cycle-report?teamId=team-1');

    await waitFor(() => {
      expect(screen.getByText('Blocked without cycle')).toBeInTheDocument();
    });
  });

  it('shows a section-level error when the blocked-issues endpoint fails', async () => {
    const { syncGateway, cyclesGateway } = stubShellWithCycles(['cycle-1']);
    overrideUsecases({
      listAvailableTeams: new ListAvailableTeamsUsecase(syncGateway),
      listTeamCycles: new ListTeamCyclesUsecase(cyclesGateway),
      getCycleMetrics: new GetCycleMetricsUsecase(
        new StubCycleMetricsGateway(),
      ),
      getBottleneckAnalysis: new GetBottleneckAnalysisUsecase(
        new StubBottleneckAnalysisGateway(),
      ),
      listBlockedIssues: new ListBlockedIssuesUsecase(
        new FailingBlockedIssuesGateway(),
      ),
    });

    renderAtPath('/cycle-report?teamId=team-1&cycleId=cycle-1');

    await waitFor(() => {
      expect(
        screen.getByText('Failed to fetch blocked issues'),
      ).toBeInTheDocument();
    });
  });
});
