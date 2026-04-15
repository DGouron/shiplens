import { type WorkspaceDashboardDto } from '../../entities/workspace-dashboard/workspace-dashboard.dto.ts';
import { WorkspaceDashboardGateway } from '../../entities/workspace-dashboard/workspace-dashboard.gateway.ts';

interface StubEmptyWorkspaceDashboardGatewayOptions {
  status: 'not_connected' | 'no_teams';
  message: string;
}

export class StubEmptyWorkspaceDashboardGateway extends WorkspaceDashboardGateway {
  private readonly response: WorkspaceDashboardDto;

  constructor(options: StubEmptyWorkspaceDashboardGatewayOptions) {
    super();
    this.response = { status: options.status, message: options.message };
  }

  async fetchDashboard(): Promise<WorkspaceDashboardDto> {
    return this.response;
  }
}
