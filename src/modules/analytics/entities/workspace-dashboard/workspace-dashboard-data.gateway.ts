import {
  type ActiveCycleData,
  type TeamSummary,
} from './workspace-dashboard.schema.js';

export abstract class WorkspaceDashboardDataGateway {
  abstract isWorkspaceConnected(): Promise<boolean>;
  abstract getSynchronizedTeams(): Promise<TeamSummary[]>;
  abstract getActiveCycle(teamId: string): Promise<ActiveCycleData | null>;
  abstract getPreviousCycleVelocities(teamId: string): Promise<number[]>;
  abstract getLastSyncDate(teamId: string): Promise<Date | null>;
}
