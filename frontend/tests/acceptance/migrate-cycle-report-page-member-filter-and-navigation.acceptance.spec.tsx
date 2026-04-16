import { act, render, screen, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from '@/app.tsx';
import { overrideUsecases, resetUsecases } from '@/main/dependencies.ts';
import { CycleReportView } from '@/modules/analytics/interface-adapters/views/cycle-report/cycle-report.view.tsx';
import { StubBlockedIssuesGateway } from '@/modules/analytics/testing/good-path/stub.blocked-issues.in-memory.gateway.ts';
import { StubBottleneckAnalysisGateway } from '@/modules/analytics/testing/good-path/stub.bottleneck-analysis.in-memory.gateway.ts';
import { StubCycleMetricsGateway } from '@/modules/analytics/testing/good-path/stub.cycle-metrics.in-memory.gateway.ts';
import { StubDriftingIssuesGateway } from '@/modules/analytics/testing/good-path/stub.drifting-issues.in-memory.gateway.ts';
import { StubEstimationAccuracyGateway } from '@/modules/analytics/testing/good-path/stub.estimation-accuracy.in-memory.gateway.ts';
import { StubSprintReportGateway } from '@/modules/analytics/testing/good-path/stub.sprint-report.in-memory.gateway.ts';
import { StubTeamCyclesGateway } from '@/modules/analytics/testing/good-path/stub.team-cycles.in-memory.gateway.ts';
import { GenerateSprintReportUsecase } from '@/modules/analytics/usecases/generate-sprint-report.usecase.ts';
import { GetBottleneckAnalysisUsecase } from '@/modules/analytics/usecases/get-bottleneck-analysis.usecase.ts';
import { GetCycleMetricsUsecase } from '@/modules/analytics/usecases/get-cycle-metrics.usecase.ts';
import { GetEstimationAccuracyUsecase } from '@/modules/analytics/usecases/get-estimation-accuracy.usecase.ts';
import { GetSprintReportDetailUsecase } from '@/modules/analytics/usecases/get-sprint-report-detail.usecase.ts';
import { ListAvailableTeamsUsecase } from '@/modules/analytics/usecases/list-available-teams.usecase.ts';
import { ListBlockedIssuesUsecase } from '@/modules/analytics/usecases/list-blocked-issues.usecase.ts';
import { ListDriftingIssuesUsecase } from '@/modules/analytics/usecases/list-drifting-issues.usecase.ts';
import { ListSprintReportsUsecase } from '@/modules/analytics/usecases/list-sprint-reports.usecase.ts';
import { ListTeamCyclesUsecase } from '@/modules/analytics/usecases/list-team-cycles.usecase.ts';
import { StubSyncGateway } from '@/modules/synchronization/testing/good-path/stub.sync.in-memory.gateway.ts';
import { BlockedIssueAlertResponseBuilder } from '../builders/blocked-issue-alert-response.builder.ts';
import { CycleSummaryResponseBuilder } from '../builders/cycle-summary-response.builder.ts';
import { DriftingIssueResponseBuilder } from '../builders/drifting-issue-response.builder.ts';
import { SyncAvailableTeamResponseBuilder } from '../builders/sync-available-team-response.builder.ts';
import { TeamCyclesResponseBuilder } from '../builders/team-cycles-response.builder.ts';
import { withQueryClient } from '../helpers/query-client-wrapper.tsx';

function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="location-probe">{`${location.pathname}${location.search}`}</div>
  );
}

function renderAtPath(initialPath: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <App />,
        children: [
          {
            path: 'cycle-report',
            element: (
              <>
                <CycleReportView />
                <LocationProbe />
              </>
            ),
          },
          {
            path: 'member-health-trends',
            element: <LocationProbe />,
          },
        ],
      },
    ],
    { initialEntries: [initialPath] },
  );
  return render(withQueryClient(<RouterProvider router={router} />));
}

function baseShellStubs() {
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
      .withCycles([
        new CycleSummaryResponseBuilder()
          .withExternalId('cycle-1')
          .withName('Cycle 12')
          .build(),
      ])
      .build(),
  });
  return { syncGateway, cyclesGateway };
}

function wireUsecases(options: {
  blockedResponse: ReturnType<BlockedIssueAlertResponseBuilder['build']>[];
  driftingResponse: ReturnType<DriftingIssueResponseBuilder['build']>[];
}) {
  const { syncGateway, cyclesGateway } = baseShellStubs();
  overrideUsecases({
    listAvailableTeams: new ListAvailableTeamsUsecase(syncGateway),
    listTeamCycles: new ListTeamCyclesUsecase(cyclesGateway),
    getCycleMetrics: new GetCycleMetricsUsecase(new StubCycleMetricsGateway()),
    getBottleneckAnalysis: new GetBottleneckAnalysisUsecase(
      new StubBottleneckAnalysisGateway(),
    ),
    listBlockedIssues: new ListBlockedIssuesUsecase(
      new StubBlockedIssuesGateway({ response: options.blockedResponse }),
    ),
    getEstimationAccuracy: new GetEstimationAccuracyUsecase(
      new StubEstimationAccuracyGateway(),
    ),
    listDriftingIssues: new ListDriftingIssuesUsecase(
      new StubDriftingIssuesGateway({ response: options.driftingResponse }),
    ),
    listSprintReports: new ListSprintReportsUsecase(
      new StubSprintReportGateway({
        details: [],
        teamIdToReportIds: { 'team-1': [] },
      }),
    ),
    getSprintReportDetail: new GetSprintReportDetailUsecase(
      new StubSprintReportGateway({
        details: [],
        teamIdToReportIds: { 'team-1': [] },
      }),
    ),
    generateSprintReport: new GenerateSprintReportUsecase(
      new StubSprintReportGateway({
        details: [],
        teamIdToReportIds: { 'team-1': [] },
      }),
    ),
  });
}

describe('Migrate cycle report page member filter and navigation (acceptance)', () => {
  afterEach(() => {
    resetUsecases();
  });

  it('derives the member filter options as the deduped alphabetical union of blocked and drifting assignees, with "Whole team" first', async () => {
    wireUsecases({
      blockedResponse: [
        new BlockedIssueAlertResponseBuilder()
          .withId('blk-1')
          .withTeamId('team-1')
          .withAssigneeName('Charlie')
          .build(),
        new BlockedIssueAlertResponseBuilder()
          .withId('blk-2')
          .withTeamId('team-1')
          .withAssigneeName('Alice')
          .build(),
      ],
      driftingResponse: [
        new DriftingIssueResponseBuilder()
          .withIssueExternalId('LIN-1')
          .withTeamId('team-1')
          .withAssigneeName('Bob')
          .build(),
        new DriftingIssueResponseBuilder()
          .withIssueExternalId('LIN-2')
          .withTeamId('team-1')
          .withAssigneeName('Alice')
          .build(),
      ],
    });

    renderAtPath('/cycle-report?teamId=team-1&cycleId=cycle-1');

    const dropdown = await screen.findByRole('combobox', {
      name: /Filter by member/i,
    });
    const optionLabels = within(dropdown)
      .getAllByRole('option')
      .map((option) => option.textContent);
    expect(optionLabels).toEqual(['Whole team', 'Alice', 'Bob', 'Charlie']);
  });

  it('filters the blocked and drifting sections to the selected member and clears when "Whole team" is chosen', async () => {
    wireUsecases({
      blockedResponse: [
        new BlockedIssueAlertResponseBuilder()
          .withId('blk-alice')
          .withIssueTitle('Alice blocked issue')
          .withTeamId('team-1')
          .withAssigneeName('Alice')
          .build(),
        new BlockedIssueAlertResponseBuilder()
          .withId('blk-bob')
          .withIssueTitle('Bob blocked issue')
          .withTeamId('team-1')
          .withAssigneeName('Bob')
          .build(),
      ],
      driftingResponse: [
        new DriftingIssueResponseBuilder()
          .withIssueExternalId('LIN-alice')
          .withIssueTitle('Alice drifting issue')
          .withTeamId('team-1')
          .withAssigneeName('Alice')
          .build(),
        new DriftingIssueResponseBuilder()
          .withIssueExternalId('LIN-bob')
          .withIssueTitle('Bob drifting issue')
          .withTeamId('team-1')
          .withAssigneeName('Bob')
          .build(),
      ],
    });

    const { getByRole } = renderAtPath(
      '/cycle-report?teamId=team-1&cycleId=cycle-1',
    );

    await waitFor(() => {
      expect(screen.getByText('Alice blocked issue')).toBeInTheDocument();
      expect(screen.getByText('Bob blocked issue')).toBeInTheDocument();
    });

    const dropdown = getByRole('combobox', { name: /Filter by member/i });
    await act(async () => {
      (dropdown as HTMLSelectElement).value = 'Alice';
      dropdown.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await waitFor(() => {
      expect(screen.getByText('Alice blocked issue')).toBeInTheDocument();
      expect(screen.queryByText('Bob blocked issue')).toBeNull();
      expect(screen.getByText('Alice drifting issue')).toBeInTheDocument();
      expect(screen.queryByText('Bob drifting issue')).toBeNull();
    });

    await act(async () => {
      (dropdown as HTMLSelectElement).value = '';
      dropdown.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await waitFor(() => {
      expect(screen.getByText('Bob blocked issue')).toBeInTheDocument();
      expect(screen.getByText('Bob drifting issue')).toBeInTheDocument();
    });
  });

  it('navigates to the member-health-trends route when a member name is clicked in an issue row', async () => {
    wireUsecases({
      blockedResponse: [
        new BlockedIssueAlertResponseBuilder()
          .withId('blk-bob')
          .withTeamId('team-1')
          .withAssigneeName('Bob')
          .build(),
      ],
      driftingResponse: [],
    });

    renderAtPath('/cycle-report?teamId=team-1&cycleId=cycle-1');

    const memberLink = await screen.findByRole('link', { name: 'Bob' });

    await act(async () => {
      memberLink.click();
    });

    await waitFor(() => {
      const probe = screen.getByTestId('location-probe');
      expect(probe.textContent).toBe(
        '/member-health-trends?teamId=team-1&memberName=Bob',
      );
    });
  });
});
