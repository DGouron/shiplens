import { GatewayError } from '@shared/foundation/gateway-error.js';
import {
  type ActiveCycleData,
  type TeamSummary,
} from '../../entities/workspace-dashboard/workspace-dashboard.schema.js';
import { WorkspaceDashboardDataGateway } from '../../entities/workspace-dashboard/workspace-dashboard-data.gateway.js';

export class FailingWorkspaceDashboardDataGateway extends WorkspaceDashboardDataGateway {
  async isWorkspaceConnected(): Promise<boolean> {
    throw new GatewayError('Gateway failure: isWorkspaceConnected');
  }

  async getSynchronizedTeams(): Promise<TeamSummary[]> {
    throw new GatewayError('Gateway failure: getSynchronizedTeams');
  }

  async getActiveCycle(): Promise<ActiveCycleData | null> {
    throw new GatewayError('Gateway failure: getActiveCycle');
  }

  async getPreviousCycleVelocities(): Promise<number[]> {
    throw new GatewayError('Gateway failure: getPreviousCycleVelocities');
  }

  async getLastSyncDate(): Promise<Date | null> {
    throw new GatewayError('Gateway failure: getLastSyncDate');
  }
}
