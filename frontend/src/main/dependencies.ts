import { BlockedIssuesInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/blocked-issues.in-http.gateway.ts';
import { BottleneckAnalysisInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/bottleneck-analysis.in-http.gateway.ts';
import { CycleMetricsInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/cycle-metrics.in-http.gateway.ts';
import { DriftingIssuesInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/drifting-issues.in-http.gateway.ts';
import { EstimationAccuracyInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/estimation-accuracy.in-http.gateway.ts';
import { SprintReportInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/sprint-report.in-http.gateway.ts';
import { TeamCyclesInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/team-cycles.in-http.gateway.ts';
import { WorkspaceDashboardInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/workspace-dashboard.in-http.gateway.ts';
import { GenerateSprintReportUsecase } from '@/modules/analytics/usecases/generate-sprint-report.usecase.ts';
import { GetBottleneckAnalysisUsecase } from '@/modules/analytics/usecases/get-bottleneck-analysis.usecase.ts';
import { GetCycleMetricsUsecase } from '@/modules/analytics/usecases/get-cycle-metrics.usecase.ts';
import { GetEstimationAccuracyUsecase } from '@/modules/analytics/usecases/get-estimation-accuracy.usecase.ts';
import { GetSprintReportDetailUsecase } from '@/modules/analytics/usecases/get-sprint-report-detail.usecase.ts';
import { GetWorkspaceDashboardUsecase } from '@/modules/analytics/usecases/get-workspace-dashboard.usecase.ts';
import { ListAvailableTeamsUsecase } from '@/modules/analytics/usecases/list-available-teams.usecase.ts';
import { ListBlockedIssuesUsecase } from '@/modules/analytics/usecases/list-blocked-issues.usecase.ts';
import { ListDriftingIssuesUsecase } from '@/modules/analytics/usecases/list-drifting-issues.usecase.ts';
import { ListSprintReportsUsecase } from '@/modules/analytics/usecases/list-sprint-reports.usecase.ts';
import { ListTeamCyclesUsecase } from '@/modules/analytics/usecases/list-team-cycles.usecase.ts';
import { SyncInHttpGateway } from '@/modules/synchronization/interface-adapters/gateways/sync.in-http.gateway.ts';
import { DiscoverSyncTeamsUsecase } from '@/modules/synchronization/usecases/discover-sync-teams.usecase.ts';
import { GetSyncSelectionUsecase } from '@/modules/synchronization/usecases/get-sync-selection.usecase.ts';
import { SelectAllSyncTargetsUsecase } from '@/modules/synchronization/usecases/select-all-sync-targets.usecase.ts';
import { SyncReferenceDataUsecase } from '@/modules/synchronization/usecases/sync-reference-data.usecase.ts';
import { SyncTeamIssuesUsecase } from '@/modules/synchronization/usecases/sync-team-issues.usecase.ts';

const workspaceDashboardGateway = new WorkspaceDashboardInHttpGateway();
const syncGateway = new SyncInHttpGateway();
const teamCyclesGateway = new TeamCyclesInHttpGateway();
const cycleMetricsGateway = new CycleMetricsInHttpGateway();
const bottleneckAnalysisGateway = new BottleneckAnalysisInHttpGateway();
const blockedIssuesGateway = new BlockedIssuesInHttpGateway();
const estimationAccuracyGateway = new EstimationAccuracyInHttpGateway();
const driftingIssuesGateway = new DriftingIssuesInHttpGateway();
const sprintReportGateway = new SprintReportInHttpGateway();

export const usecases = {
  getWorkspaceDashboard: new GetWorkspaceDashboardUsecase(
    workspaceDashboardGateway,
  ),
  discoverSyncTeams: new DiscoverSyncTeamsUsecase(syncGateway),
  selectAllSyncTargets: new SelectAllSyncTargetsUsecase(syncGateway),
  getSyncSelection: new GetSyncSelectionUsecase(syncGateway),
  syncReferenceData: new SyncReferenceDataUsecase(syncGateway),
  syncTeamIssues: new SyncTeamIssuesUsecase(syncGateway),
  listAvailableTeams: new ListAvailableTeamsUsecase(syncGateway),
  listTeamCycles: new ListTeamCyclesUsecase(teamCyclesGateway),
  getCycleMetrics: new GetCycleMetricsUsecase(cycleMetricsGateway),
  getBottleneckAnalysis: new GetBottleneckAnalysisUsecase(
    bottleneckAnalysisGateway,
  ),
  listBlockedIssues: new ListBlockedIssuesUsecase(blockedIssuesGateway),
  getEstimationAccuracy: new GetEstimationAccuracyUsecase(
    estimationAccuracyGateway,
  ),
  listDriftingIssues: new ListDriftingIssuesUsecase(driftingIssuesGateway),
  listSprintReports: new ListSprintReportsUsecase(sprintReportGateway),
  getSprintReportDetail: new GetSprintReportDetailUsecase(sprintReportGateway),
  generateSprintReport: new GenerateSprintReportUsecase(sprintReportGateway),
};

export function overrideUsecases(overrides: Partial<typeof usecases>): void {
  Object.assign(usecases, overrides);
}

export function resetUsecases(): void {
  usecases.getWorkspaceDashboard = new GetWorkspaceDashboardUsecase(
    workspaceDashboardGateway,
  );
  usecases.discoverSyncTeams = new DiscoverSyncTeamsUsecase(syncGateway);
  usecases.selectAllSyncTargets = new SelectAllSyncTargetsUsecase(syncGateway);
  usecases.getSyncSelection = new GetSyncSelectionUsecase(syncGateway);
  usecases.syncReferenceData = new SyncReferenceDataUsecase(syncGateway);
  usecases.syncTeamIssues = new SyncTeamIssuesUsecase(syncGateway);
  usecases.listAvailableTeams = new ListAvailableTeamsUsecase(syncGateway);
  usecases.listTeamCycles = new ListTeamCyclesUsecase(teamCyclesGateway);
  usecases.getCycleMetrics = new GetCycleMetricsUsecase(cycleMetricsGateway);
  usecases.getBottleneckAnalysis = new GetBottleneckAnalysisUsecase(
    bottleneckAnalysisGateway,
  );
  usecases.listBlockedIssues = new ListBlockedIssuesUsecase(
    blockedIssuesGateway,
  );
  usecases.getEstimationAccuracy = new GetEstimationAccuracyUsecase(
    estimationAccuracyGateway,
  );
  usecases.listDriftingIssues = new ListDriftingIssuesUsecase(
    driftingIssuesGateway,
  );
  usecases.listSprintReports = new ListSprintReportsUsecase(
    sprintReportGateway,
  );
  usecases.getSprintReportDetail = new GetSprintReportDetailUsecase(
    sprintReportGateway,
  );
  usecases.generateSprintReport = new GenerateSprintReportUsecase(
    sprintReportGateway,
  );
}
