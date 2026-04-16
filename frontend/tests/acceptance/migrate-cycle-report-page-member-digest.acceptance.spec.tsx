import { act, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '@/app.tsx';
import { overrideUsecases, resetUsecases } from '@/main/dependencies.ts';
import { CycleReportView } from '@/modules/analytics/interface-adapters/views/cycle-report/cycle-report.view.tsx';
import { StubBlockedIssuesGateway } from '@/modules/analytics/testing/good-path/stub.blocked-issues.in-memory.gateway.ts';
import { StubBottleneckAnalysisGateway } from '@/modules/analytics/testing/good-path/stub.bottleneck-analysis.in-memory.gateway.ts';
import { StubCycleMetricsGateway } from '@/modules/analytics/testing/good-path/stub.cycle-metrics.in-memory.gateway.ts';
import { StubDriftingIssuesGateway } from '@/modules/analytics/testing/good-path/stub.drifting-issues.in-memory.gateway.ts';
import { StubEstimationAccuracyGateway } from '@/modules/analytics/testing/good-path/stub.estimation-accuracy.in-memory.gateway.ts';
import { StubMemberDigestGateway } from '@/modules/analytics/testing/good-path/stub.member-digest.in-memory.gateway.ts';
import { StubSprintReportGateway } from '@/modules/analytics/testing/good-path/stub.sprint-report.in-memory.gateway.ts';
import { StubTeamCyclesGateway } from '@/modules/analytics/testing/good-path/stub.team-cycles.in-memory.gateway.ts';
import { GenerateMemberDigestUsecase } from '@/modules/analytics/usecases/generate-member-digest.usecase.ts';
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

function baseUsecases(memberDigestGateway: StubMemberDigestGateway) {
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
  const sprintReportGateway = new StubSprintReportGateway({
    details: [],
    teamIdToReportIds: { 'team-1': [] },
  });
  return {
    listAvailableTeams: new ListAvailableTeamsUsecase(syncGateway),
    listTeamCycles: new ListTeamCyclesUsecase(cyclesGateway),
    getCycleMetrics: new GetCycleMetricsUsecase(new StubCycleMetricsGateway()),
    getBottleneckAnalysis: new GetBottleneckAnalysisUsecase(
      new StubBottleneckAnalysisGateway(),
    ),
    listBlockedIssues: new ListBlockedIssuesUsecase(
      new StubBlockedIssuesGateway({
        response: [
          new BlockedIssueAlertResponseBuilder()
            .withId('blk-1')
            .withTeamId('team-1')
            .withAssigneeName('Alice')
            .build(),
        ],
      }),
    ),
    getEstimationAccuracy: new GetEstimationAccuracyUsecase(
      new StubEstimationAccuracyGateway(),
    ),
    listDriftingIssues: new ListDriftingIssuesUsecase(
      new StubDriftingIssuesGateway(),
    ),
    listSprintReports: new ListSprintReportsUsecase(sprintReportGateway),
    getSprintReportDetail: new GetSprintReportDetailUsecase(
      sprintReportGateway,
    ),
    generateSprintReport: new GenerateSprintReportUsecase(sprintReportGateway),
    generateMemberDigest: new GenerateMemberDigestUsecase(memberDigestGateway),
  };
}

describe('Migrate cycle report page member digest (acceptance)', () => {
  let writeTextMock: ReturnType<typeof vi.fn<(text: string) => Promise<void>>>;

  beforeEach(() => {
    writeTextMock = vi
      .fn<(text: string) => Promise<void>>()
      .mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: writeTextMock },
    });
  });

  afterEach(() => {
    resetUsecases();
    vi.restoreAllMocks();
  });

  it('does not show the member digest section when no member is selected (Whole team)', async () => {
    const digestGateway = new StubMemberDigestGateway({});
    overrideUsecases(baseUsecases(digestGateway));

    renderAtPath('/cycle-report?teamId=team-1&cycleId=cycle-1');

    await waitFor(() => {
      expect(screen.getByTestId('cycle-report-page')).toBeInTheDocument();
    });

    expect(
      screen.queryByTestId('member-digest-section'),
    ).not.toBeInTheDocument();
  });

  it('shows the generate digest button when a specific member is selected', async () => {
    const digestGateway = new StubMemberDigestGateway({});
    overrideUsecases(baseUsecases(digestGateway));

    renderAtPath(
      '/cycle-report?teamId=team-1&cycleId=cycle-1&memberName=Alice',
    );

    await waitFor(() => {
      expect(screen.getByTestId('member-digest-section')).toBeInTheDocument();
    });

    expect(
      screen.getByRole('button', { name: /Generate digest/i }),
    ).toBeInTheDocument();
  });

  it('generates a digest and renders the markdown when the user clicks Generate digest', async () => {
    const digestGateway = new StubMemberDigestGateway({
      digestByMember: {
        Alice: '# Alice Digest\n\nHere is the member digest.',
      },
    });
    overrideUsecases(baseUsecases(digestGateway));

    renderAtPath(
      '/cycle-report?teamId=team-1&cycleId=cycle-1&memberName=Alice',
    );

    const generateButton = await screen.findByRole('button', {
      name: /Generate digest/i,
    });

    await act(async () => {
      generateButton.click();
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Here is the member digest\./),
      ).toBeInTheDocument();
    });
  });

  it('shows an empty message when the backend returns a null digest', async () => {
    const digestGateway = new StubMemberDigestGateway({
      digestByMember: {
        Alice: null,
      },
    });
    overrideUsecases(baseUsecases(digestGateway));

    renderAtPath(
      '/cycle-report?teamId=team-1&cycleId=cycle-1&memberName=Alice',
    );

    const generateButton = await screen.findByRole('button', {
      name: /Generate digest/i,
    });

    await act(async () => {
      generateButton.click();
    });

    await waitFor(() => {
      expect(
        screen.getByText(/No issues found for this member/i),
      ).toBeInTheDocument();
    });
  });

  it('copies the digest to the clipboard and shows a confirmation', async () => {
    const digestGateway = new StubMemberDigestGateway({
      digestByMember: {
        Alice: '# Copy this digest',
      },
    });
    overrideUsecases(baseUsecases(digestGateway));

    renderAtPath(
      '/cycle-report?teamId=team-1&cycleId=cycle-1&memberName=Alice',
    );

    const generateButton = await screen.findByRole('button', {
      name: /Generate digest/i,
    });

    await act(async () => {
      generateButton.click();
    });

    const copyButton = await screen.findByRole('button', {
      name: /Copy/i,
    });

    await act(async () => {
      copyButton.click();
    });

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith('# Copy this digest');
    });

    await waitFor(() => {
      expect(screen.getByText('Digest copied!')).toBeInTheDocument();
    });
  });
});
