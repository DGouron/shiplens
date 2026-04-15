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
import { CycleSummaryResponseBuilder } from '../builders/cycle-summary-response.builder.ts';
import { SprintReportDetailBuilder } from '../builders/sprint-report-detail.builder.ts';
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

function baseNonAiUsecases() {
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
    getEstimationAccuracy: new GetEstimationAccuracyUsecase(
      new StubEstimationAccuracyGateway(),
    ),
    listDriftingIssues: new ListDriftingIssuesUsecase(
      new StubDriftingIssuesGateway(),
    ),
  };
}

function overrideSprintReport(gateway: StubSprintReportGateway) {
  overrideUsecases({
    listSprintReports: new ListSprintReportsUsecase(gateway),
    getSprintReportDetail: new GetSprintReportDetailUsecase(gateway),
    generateSprintReport: new GenerateSprintReportUsecase(gateway),
  });
}

describe('Migrate cycle report page AI report (acceptance)', () => {
  let writeTextMock: ReturnType<typeof vi.fn<(text: string) => Promise<void>>>;
  let createObjectUrlMock: ReturnType<typeof vi.fn<(blob: Blob) => string>>;
  let revokeObjectUrlMock: ReturnType<typeof vi.fn<(url: string) => void>>;
  let originalCreateElement: typeof document.createElement;

  beforeEach(() => {
    writeTextMock = vi
      .fn<(text: string) => Promise<void>>()
      .mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: writeTextMock },
    });

    createObjectUrlMock = vi
      .fn<(blob: Blob) => string>()
      .mockReturnValue('blob:mock-url');
    revokeObjectUrlMock = vi.fn<(url: string) => void>();
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: createObjectUrlMock,
      revokeObjectURL: revokeObjectUrlMock,
    });

    originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation(
      (tagName: string) => {
        const element = originalCreateElement(tagName);
        if (tagName === 'a') {
          element.click = () => {};
        }
        return element;
      },
    );
  });

  afterEach(() => {
    resetUsecases();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders the generated markdown when a report exists for the selected cycle', async () => {
    const detail = new SprintReportDetailBuilder()
      .withId('report-1')
      .withCycleName('Cycle 12')
      .withMarkdown('# Cycle 12\n\nReport content here.')
      .build();
    overrideUsecases(baseNonAiUsecases());
    overrideSprintReport(
      new StubSprintReportGateway({
        details: [detail],
        teamIdToReportIds: { 'team-1': ['report-1'] },
      }),
    );

    renderAtPath('/cycle-report?teamId=team-1&cycleId=cycle-1');

    await waitFor(() => {
      expect(screen.getByText(/Report content here\./)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Export/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copy/i })).toBeInTheDocument();
  });

  it('shows the empty message and a Generate button when no report exists for the cycle', async () => {
    overrideUsecases(baseNonAiUsecases());
    overrideSprintReport(
      new StubSprintReportGateway({
        details: [],
        teamIdToReportIds: { 'team-1': [] },
      }),
    );

    renderAtPath('/cycle-report?teamId=team-1&cycleId=cycle-1');

    await waitFor(() => {
      expect(
        screen.getByText('No report generated for this cycle'),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: /Generate report/i }),
    ).toBeInTheDocument();
  });

  it('generates a report when the user clicks the Generate button', async () => {
    const gateway = new StubSprintReportGateway({
      details: [],
      teamIdToReportIds: { 'team-1': [] },
      onGenerate: ({ cycleId }) =>
        new SprintReportDetailBuilder()
          .withId('generated-1')
          .withCycleName('Cycle 12')
          .withMarkdown(`# Freshly generated report for ${cycleId}`)
          .build(),
    });
    overrideUsecases(baseNonAiUsecases());
    overrideSprintReport(gateway);

    renderAtPath('/cycle-report?teamId=team-1&cycleId=cycle-1');

    const generateButton = await screen.findByRole('button', {
      name: /Generate report/i,
    });

    await act(async () => {
      generateButton.click();
    });

    await waitFor(() => {
      expect(gateway.generateCalls).toEqual([
        { teamId: 'team-1', cycleId: 'cycle-1' },
      ]);
    });
    await waitFor(() => {
      expect(
        screen.getByText(/Freshly generated report for cycle-1/),
      ).toBeInTheDocument();
    });
  });

  it('exports the markdown as a downloadable blob when the user clicks Export', async () => {
    const detail = new SprintReportDetailBuilder()
      .withId('report-1')
      .withCycleName('Cycle 12')
      .withMarkdown('# Export me')
      .build();
    overrideUsecases(baseNonAiUsecases());
    overrideSprintReport(
      new StubSprintReportGateway({
        details: [detail],
        teamIdToReportIds: { 'team-1': ['report-1'] },
      }),
    );

    renderAtPath('/cycle-report?teamId=team-1&cycleId=cycle-1');

    const exportButton = await screen.findByRole('button', { name: /Export/i });

    await act(async () => {
      exportButton.click();
    });

    expect(createObjectUrlMock).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrlMock).toHaveBeenCalledWith('blob:mock-url');
  });

  it('copies the markdown to the clipboard and shows a confirmation when the user clicks Copy', async () => {
    const detail = new SprintReportDetailBuilder()
      .withId('report-1')
      .withCycleName('Cycle 12')
      .withMarkdown('# Copy me')
      .build();
    overrideUsecases(baseNonAiUsecases());
    overrideSprintReport(
      new StubSprintReportGateway({
        details: [detail],
        teamIdToReportIds: { 'team-1': ['report-1'] },
      }),
    );

    renderAtPath('/cycle-report?teamId=team-1&cycleId=cycle-1');

    const copyButton = await screen.findByRole('button', { name: /Copy/i });

    await act(async () => {
      copyButton.click();
    });

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith('# Copy me');
    });
    await waitFor(() => {
      expect(screen.getByText('Report copied!')).toBeInTheDocument();
    });
  });
});
