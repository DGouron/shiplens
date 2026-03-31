import { WorkspaceDashboardDataGateway } from '../../entities/workspace-dashboard/workspace-dashboard-data.gateway.js';
import { type TeamSummary, type ActiveCycleData } from '../../entities/workspace-dashboard/workspace-dashboard.schema.js';

export class StubWorkspaceDashboardDataGateway extends WorkspaceDashboardDataGateway {
  workspaceConnected = true;
  teams: TeamSummary[] = [];
  activeCycles: Record<string, ActiveCycleData> = {};
  previousCycleVelocities: Record<string, number[]> = {};
  lastSyncDates: Record<string, Date> = {};

  async isWorkspaceConnected(): Promise<boolean> {
    return this.workspaceConnected;
  }

  async getSynchronizedTeams(): Promise<TeamSummary[]> {
    return this.teams;
  }

  async getActiveCycle(teamId: string): Promise<ActiveCycleData | null> {
    return this.activeCycles[teamId] ?? null;
  }

  async getPreviousCycleVelocities(teamId: string): Promise<number[]> {
    return this.previousCycleVelocities[teamId] ?? [];
  }

  async getLastSyncDate(teamId: string): Promise<Date | null> {
    return this.lastSyncDates[teamId] ?? null;
  }
}
