import { TeamCyclesInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/team-cycles.in-http.gateway.ts';
import { WorkspaceDashboardInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/workspace-dashboard.in-http.gateway.ts';
import { GetWorkspaceDashboardUsecase } from '@/modules/analytics/usecases/get-workspace-dashboard.usecase.ts';
import { ListAvailableTeamsUsecase } from '@/modules/analytics/usecases/list-available-teams.usecase.ts';
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
}
