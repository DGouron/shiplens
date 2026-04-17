import { BlockedIssuesInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/blocked-issues.in-http.gateway.ts';
import { BottleneckAnalysisInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/bottleneck-analysis.in-http.gateway.ts';
import { CycleMetricsInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/cycle-metrics.in-http.gateway.ts';
import { DriftGridInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/drift-grid.in-http.gateway.ts';
import { DriftingIssuesInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/drifting-issues.in-http.gateway.ts';
import { EstimationAccuracyInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/estimation-accuracy.in-http.gateway.ts';
import { MemberDigestInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/member-digest.in-http.gateway.ts';
import { MemberHealthInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/member-health.in-http.gateway.ts';
import { SprintReportInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/sprint-report.in-http.gateway.ts';
import { TeamCyclesInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/team-cycles.in-http.gateway.ts';
import { TeamSelectionInLocalStorageGateway } from '@/modules/analytics/interface-adapters/gateways/team-selection.in-localstorage.gateway.ts';
import { TeamSettingsInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/team-settings.in-http.gateway.ts';
import { WorkflowConfigInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/workflow-config.in-http.gateway.ts';
import { WorkspaceDashboardInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/workspace-dashboard.in-http.gateway.ts';
import { WorkspaceLanguageInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/workspace-language.in-http.gateway.ts';
import { GenerateMemberDigestUsecase } from '@/modules/analytics/usecases/generate-member-digest.usecase.ts';
import { GenerateSprintReportUsecase } from '@/modules/analytics/usecases/generate-sprint-report.usecase.ts';
import { GetBottleneckAnalysisUsecase } from '@/modules/analytics/usecases/get-bottleneck-analysis.usecase.ts';
import { GetCycleMetricsUsecase } from '@/modules/analytics/usecases/get-cycle-metrics.usecase.ts';
import { GetDriftGridEntriesUsecase } from '@/modules/analytics/usecases/get-drift-grid-entries.usecase.ts';
import { GetEstimationAccuracyUsecase } from '@/modules/analytics/usecases/get-estimation-accuracy.usecase.ts';
import { GetMemberHealthUsecase } from '@/modules/analytics/usecases/get-member-health.usecase.ts';
import { GetPersistedTeamSelectionUsecase } from '@/modules/analytics/usecases/get-persisted-team-selection.usecase.ts';
import { GetSprintReportDetailUsecase } from '@/modules/analytics/usecases/get-sprint-report-detail.usecase.ts';
import { GetTeamStatusSettingsUsecase } from '@/modules/analytics/usecases/get-team-status-settings.usecase.ts';
import { GetTeamTimezoneUsecase } from '@/modules/analytics/usecases/get-team-timezone.usecase.ts';
import { GetTeamWorkflowConfigUsecase } from '@/modules/analytics/usecases/get-team-workflow-config.usecase.ts';
import { GetWorkspaceDashboardUsecase } from '@/modules/analytics/usecases/get-workspace-dashboard.usecase.ts';
import { GetWorkspaceLanguageUsecase } from '@/modules/analytics/usecases/get-workspace-language.usecase.ts';
import { ListAvailableTeamsUsecase } from '@/modules/analytics/usecases/list-available-teams.usecase.ts';
import { ListBlockedIssuesUsecase } from '@/modules/analytics/usecases/list-blocked-issues.usecase.ts';
import { ListDriftingIssuesUsecase } from '@/modules/analytics/usecases/list-drifting-issues.usecase.ts';
import { ListSprintReportsUsecase } from '@/modules/analytics/usecases/list-sprint-reports.usecase.ts';
import { ListTeamCyclesUsecase } from '@/modules/analytics/usecases/list-team-cycles.usecase.ts';
import { PersistTeamSelectionUsecase } from '@/modules/analytics/usecases/persist-team-selection.usecase.ts';
import { SetTeamExcludedStatusesUsecase } from '@/modules/analytics/usecases/set-team-excluded-statuses.usecase.ts';
import { SetTeamTimezoneUsecase } from '@/modules/analytics/usecases/set-team-timezone.usecase.ts';
import { SetTeamWorkflowConfigUsecase } from '@/modules/analytics/usecases/set-team-workflow-config.usecase.ts';
import { SetWorkspaceLanguageUsecase } from '@/modules/analytics/usecases/set-workspace-language.usecase.ts';
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
const memberDigestGateway = new MemberDigestInHttpGateway();
const memberHealthGateway = new MemberHealthInHttpGateway();
const workspaceLanguageGateway = new WorkspaceLanguageInHttpGateway();
const teamSettingsGateway = new TeamSettingsInHttpGateway();
const driftGridGateway = new DriftGridInHttpGateway();
const workflowConfigGateway = new WorkflowConfigInHttpGateway();
const teamSelectionStorageGateway = new TeamSelectionInLocalStorageGateway();

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
  generateMemberDigest: new GenerateMemberDigestUsecase(memberDigestGateway),
  getMemberHealth: new GetMemberHealthUsecase(memberHealthGateway),
  getWorkspaceLanguage: new GetWorkspaceLanguageUsecase(
    workspaceLanguageGateway,
  ),
  setWorkspaceLanguage: new SetWorkspaceLanguageUsecase(
    workspaceLanguageGateway,
  ),
  getTeamTimezone: new GetTeamTimezoneUsecase(teamSettingsGateway),
  setTeamTimezone: new SetTeamTimezoneUsecase(teamSettingsGateway),
  getTeamStatusSettings: new GetTeamStatusSettingsUsecase(teamSettingsGateway),
  setTeamExcludedStatuses: new SetTeamExcludedStatusesUsecase(
    teamSettingsGateway,
  ),
  getDriftGridEntries: new GetDriftGridEntriesUsecase(driftGridGateway),
  getTeamWorkflowConfig: new GetTeamWorkflowConfigUsecase(
    workflowConfigGateway,
  ),
  setTeamWorkflowConfig: new SetTeamWorkflowConfigUsecase(
    workflowConfigGateway,
  ),
  getPersistedTeamSelection: new GetPersistedTeamSelectionUsecase(
    teamSelectionStorageGateway,
  ),
  persistTeamSelection: new PersistTeamSelectionUsecase(
    teamSelectionStorageGateway,
  ),
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
  usecases.generateMemberDigest = new GenerateMemberDigestUsecase(
    memberDigestGateway,
  );
  usecases.getMemberHealth = new GetMemberHealthUsecase(memberHealthGateway);
  usecases.getWorkspaceLanguage = new GetWorkspaceLanguageUsecase(
    workspaceLanguageGateway,
  );
  usecases.setWorkspaceLanguage = new SetWorkspaceLanguageUsecase(
    workspaceLanguageGateway,
  );
  usecases.getTeamTimezone = new GetTeamTimezoneUsecase(teamSettingsGateway);
  usecases.setTeamTimezone = new SetTeamTimezoneUsecase(teamSettingsGateway);
  usecases.getTeamStatusSettings = new GetTeamStatusSettingsUsecase(
    teamSettingsGateway,
  );
  usecases.setTeamExcludedStatuses = new SetTeamExcludedStatusesUsecase(
    teamSettingsGateway,
  );
  usecases.getDriftGridEntries = new GetDriftGridEntriesUsecase(
    driftGridGateway,
  );
  usecases.getTeamWorkflowConfig = new GetTeamWorkflowConfigUsecase(
    workflowConfigGateway,
  );
  usecases.setTeamWorkflowConfig = new SetTeamWorkflowConfigUsecase(
    workflowConfigGateway,
  );
  usecases.getPersistedTeamSelection = new GetPersistedTeamSelectionUsecase(
    teamSelectionStorageGateway,
  );
  usecases.persistTeamSelection = new PersistTeamSelectionUsecase(
    teamSelectionStorageGateway,
  );
}
