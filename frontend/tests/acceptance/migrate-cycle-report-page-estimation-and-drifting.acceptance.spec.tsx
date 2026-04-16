import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from '@/app.tsx';
import { overrideUsecases, resetUsecases } from '@/main/dependencies.ts';
import { CycleReportView } from '@/modules/analytics/interface-adapters/views/cycle-report/cycle-report.view.tsx';
import { FailingDriftingIssuesGateway } from '@/modules/analytics/testing/bad-path/failing.drifting-issues.in-memory.gateway.ts';
import { FailingEstimationAccuracyGateway } from '@/modules/analytics/testing/bad-path/failing.estimation-accuracy.in-memory.gateway.ts';
import { StubBlockedIssuesGateway } from '@/modules/analytics/testing/good-path/stub.blocked-issues.in-memory.gateway.ts';
import { StubBottleneckAnalysisGateway } from '@/modules/analytics/testing/good-path/stub.bottleneck-analysis.in-memory.gateway.ts';
import { StubCycleMetricsGateway } from '@/modules/analytics/testing/good-path/stub.cycle-metrics.in-memory.gateway.ts';
import { StubDriftingIssuesGateway } from '@/modules/analytics/testing/good-path/stub.drifting-issues.in-memory.gateway.ts';
import { StubEstimationAccuracyGateway } from '@/modules/analytics/testing/good-path/stub.estimation-accuracy.in-memory.gateway.ts';
import { StubTeamCyclesGateway } from '@/modules/analytics/testing/good-path/stub.team-cycles.in-memory.gateway.ts';
import { GetBottleneckAnalysisUsecase } from '@/modules/analytics/usecases/get-bottleneck-analysis.usecase.ts';
import { GetCycleMetricsUsecase } from '@/modules/analytics/usecases/get-cycle-metrics.usecase.ts';
import { GetEstimationAccuracyUsecase } from '@/modules/analytics/usecases/get-estimation-accuracy.usecase.ts';
import { ListAvailableTeamsUsecase } from '@/modules/analytics/usecases/list-available-teams.usecase.ts';
import { ListBlockedIssuesUsecase } from '@/modules/analytics/usecases/list-blocked-issues.usecase.ts';
import { ListDriftingIssuesUsecase } from '@/modules/analytics/usecases/list-drifting-issues.usecase.ts';
import { ListTeamCyclesUsecase } from '@/modules/analytics/usecases/list-team-cycles.usecase.ts';
import { StubSyncGateway } from '@/modules/synchronization/testing/good-path/stub.sync.in-memory.gateway.ts';
import { CycleSummaryResponseBuilder } from '../builders/cycle-summary-response.builder.ts';
import { DriftingIssueResponseBuilder } from '../builders/drifting-issue-response.builder.ts';
import { EstimationAccuracyResponseBuilder } from '../builders/estimation-accuracy-response.builder.ts';
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

function baseShellUsecases() {
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
          .withName('Cycle 1')
          .build(),
      ])
      .build(),
  });
  return {
    listAvailableTeams: new ListAvailableTeamsUsecase(syncGateway),
    listTeamCycles: new ListTeamCyclesUsecase(cyclesGateway),
    getCycleMetrics: new GetCycleMetricsUsecase(new StubCycleMetricsGateway()),
    getBottleneckAnalysis: new GetBottleneckAnalysisUsecase(
      new StubBottleneckAnalysisGateway(),
    ),
    listBlockedIssues: new ListBlockedIssuesUsecase(
      new StubBlockedIssuesGateway(),
    ),
  };
}

describe('Migrate cycle report page estimation and drifting (acceptance)', () => {
  afterEach(() => {
    resetUsecases();
  });

  it('renders the estimation donut with well / over / under-estimated counts', async () => {
    overrideUsecases({
      ...baseShellUsecases(),
      getEstimationAccuracy: new GetEstimationAccuracyUsecase(
        new StubEstimationAccuracyGateway({
          response: new EstimationAccuracyResponseBuilder()
            .withIssues([
              { classification: 'well-estimated' },
              { classification: 'well-estimated' },
              { classification: 'well-estimated' },
              { classification: 'over-estimated' },
              { classification: 'under-estimated' },
            ])
            .build(),
        }),
      ),
      listDriftingIssues: new ListDriftingIssuesUsecase(
        new StubDriftingIssuesGateway(),
      ),
    });

    renderAtPath('/cycle-report?teamId=team-1&cycleId=cycle-1');

    await waitFor(() => {
      expect(screen.getByText('Well estimated: 3 (60%)')).toBeInTheDocument();
    });
    expect(screen.getByText('Over-estimated: 1 (20%)')).toBeInTheDocument();
    expect(screen.getByText('Under-estimated: 1 (20%)')).toBeInTheDocument();
  });

  it('renders excluded issue counts when the cycle has excluded issues', async () => {
    overrideUsecases({
      ...baseShellUsecases(),
      getEstimationAccuracy: new GetEstimationAccuracyUsecase(
        new StubEstimationAccuracyGateway({
          response: new EstimationAccuracyResponseBuilder()
            .withExcludedWithoutEstimation(4)
            .withExcludedWithoutCycleTime(2)
            .build(),
        }),
      ),
      listDriftingIssues: new ListDriftingIssuesUsecase(
        new StubDriftingIssuesGateway(),
      ),
    });

    renderAtPath('/cycle-report?teamId=team-1&cycleId=cycle-1');

    await waitFor(() => {
      expect(
        screen.getByText('Excluded (no estimation): 4'),
      ).toBeInTheDocument();
    });
    expect(screen.getByText('Excluded (no cycle time): 2')).toBeInTheDocument();
  });

  it('shows an empty message when the cycle has no estimation data', async () => {
    overrideUsecases({
      ...baseShellUsecases(),
      getEstimationAccuracy: new GetEstimationAccuracyUsecase(
        new StubEstimationAccuracyGateway({
          response: new EstimationAccuracyResponseBuilder()
            .withIssues([])
            .withExcludedWithoutEstimation(0)
            .withExcludedWithoutCycleTime(0)
            .build(),
        }),
      ),
      listDriftingIssues: new ListDriftingIssuesUsecase(
        new StubDriftingIssuesGateway(),
      ),
    });

    renderAtPath('/cycle-report?teamId=team-1&cycleId=cycle-1');

    await waitFor(() => {
      expect(
        screen.getByText('No estimation data for this cycle'),
      ).toBeInTheDocument();
    });
  });

  it('shows a section-level error when the estimation endpoint fails', async () => {
    overrideUsecases({
      ...baseShellUsecases(),
      getEstimationAccuracy: new GetEstimationAccuracyUsecase(
        new FailingEstimationAccuracyGateway(),
      ),
      listDriftingIssues: new ListDriftingIssuesUsecase(
        new StubDriftingIssuesGateway(),
      ),
    });

    renderAtPath('/cycle-report?teamId=team-1&cycleId=cycle-1');

    await waitFor(() => {
      expect(
        screen.getByText('Failed to fetch estimation accuracy'),
      ).toBeInTheDocument();
    });
  });

  it('renders drifting issues with elapsed and expected durations', async () => {
    overrideUsecases({
      ...baseShellUsecases(),
      getEstimationAccuracy: new GetEstimationAccuracyUsecase(
        new StubEstimationAccuracyGateway(),
      ),
      listDriftingIssues: new ListDriftingIssuesUsecase(
        new StubDriftingIssuesGateway({
          response: [
            new DriftingIssueResponseBuilder()
              .withIssueExternalId('LIN-100')
              .withIssueTitle('Drifting story one')
              .withElapsedBusinessHours(72)
              .withExpectedMaxHours(24)
              .build(),
          ],
        }),
      ),
    });

    renderAtPath('/cycle-report?teamId=team-1&cycleId=cycle-1');

    await waitFor(() => {
      expect(screen.getByText('Drifting story one')).toBeInTheDocument();
    });
  });

  it('shows an empty message when the team has no drifting issues', async () => {
    overrideUsecases({
      ...baseShellUsecases(),
      getEstimationAccuracy: new GetEstimationAccuracyUsecase(
        new StubEstimationAccuracyGateway(),
      ),
      listDriftingIssues: new ListDriftingIssuesUsecase(
        new StubDriftingIssuesGateway({ response: [] }),
      ),
    });

    renderAtPath('/cycle-report?teamId=team-1&cycleId=cycle-1');

    await waitFor(() => {
      expect(
        screen.getByText('No drifting issues for this team'),
      ).toBeInTheDocument();
    });
  });

  it('shows a section-level error when the drifting-issues endpoint fails', async () => {
    overrideUsecases({
      ...baseShellUsecases(),
      getEstimationAccuracy: new GetEstimationAccuracyUsecase(
        new StubEstimationAccuracyGateway(),
      ),
      listDriftingIssues: new ListDriftingIssuesUsecase(
        new FailingDriftingIssuesGateway(),
      ),
    });

    renderAtPath('/cycle-report?teamId=team-1&cycleId=cycle-1');

    await waitFor(() => {
      expect(
        screen.getByText('Failed to fetch drifting issues'),
      ).toBeInTheDocument();
    });
  });
});
