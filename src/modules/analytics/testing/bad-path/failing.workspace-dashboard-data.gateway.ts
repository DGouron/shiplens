import {
  type ActiveCycleData,
  type TeamSummary,
} from '../../entities/workspace-dashboard/workspace-dashboard.schema.js';
import { WorkspaceDashboardDataGateway } from '../../entities/workspace-dashboard/workspace-dashboard-data.gateway.js';

export class FailingWorkspaceDashboardDataGateway extends WorkspaceDashboardDataGateway {
  async isWorkspaceConnected(): Promise<boolean> {
    throw new Error('Gateway failure: isWorkspaceConnected');
  }

  async getSynchronizedTeams(): Promise<TeamSummary[]> {
    throw new Error('Gateway failure: getSynchronizedTeams');
  }

  async getActiveCycle(): Promise<ActiveCycleData | null> {
    throw new Error('Gateway failure: getActiveCycle');
  }

  async getPreviousCycleVelocities(): Promise<number[]> {
    throw new Error('Gateway failure: getPreviousCycleVelocities');
  }

  async getLastSyncDate(): Promise<Date | null> {
    throw new Error('Gateway failure: getLastSyncDate');
  }
}
