import { WorkspaceDashboardGateway } from '../../entities/workspace-dashboard/workspace-dashboard.gateway.ts';
import { type WorkspaceDashboardResponse } from '../../entities/workspace-dashboard/workspace-dashboard.response.ts';

interface StubEmptyWorkspaceDashboardGatewayOptions {
  status: 'not_connected' | 'no_teams';
  message: string;
}

export class StubEmptyWorkspaceDashboardGateway extends WorkspaceDashboardGateway {
  private readonly response: WorkspaceDashboardResponse;

  constructor(options: StubEmptyWorkspaceDashboardGatewayOptions) {
    super();
    this.response = { status: options.status, message: options.message };
  }

  async fetchDashboard(): Promise<WorkspaceDashboardResponse> {
    return this.response;
  }
}
