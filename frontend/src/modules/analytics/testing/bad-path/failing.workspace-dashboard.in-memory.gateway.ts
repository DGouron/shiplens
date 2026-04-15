import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { WorkspaceDashboardGateway } from '../../entities/workspace-dashboard/workspace-dashboard.gateway.ts';

export class FailingWorkspaceDashboardGateway extends WorkspaceDashboardGateway {
  async fetchDashboard(): Promise<never> {
    throw new GatewayError('Failed to fetch dashboard');
  }
}
