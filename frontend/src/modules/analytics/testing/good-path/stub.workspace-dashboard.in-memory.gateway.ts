import { WorkspaceDashboardGateway } from '../../entities/workspace-dashboard/workspace-dashboard.gateway.ts';
import { type WorkspaceDashboardResponse } from '../../entities/workspace-dashboard/workspace-dashboard.response.ts';

interface StubWorkspaceDashboardGatewayOptions {
  response?: WorkspaceDashboardResponse;
}

const defaultResponse: WorkspaceDashboardResponse = {
  workspaceId: 'workspace-1',
  teams: [
    {
      teamId: 'team-1',
      teamName: 'Team One',
      hasActiveCycle: true,
      cycleName: 'Cycle 12',
      completionRate: '75%',
      blockedIssuesCount: 0,
      blockedAlert: false,
      currentVelocity: 12,
      velocityTrendLabel: 'En hausse',
      reportLink: '/cycle-report?teamId=team-1',
      noActiveCycleMessage: null,
    },
  ],
  synchronization: {
    lastSyncDate: '2026-04-15T08:00:00.000Z',
    isLate: false,
    lateWarning: null,
    nextSync: 'daily',
  },
};

export class StubWorkspaceDashboardGateway extends WorkspaceDashboardGateway {
  private readonly response: WorkspaceDashboardResponse;

  constructor(options: StubWorkspaceDashboardGatewayOptions = {}) {
    super();
    this.response = options.response ?? defaultResponse;
  }

  async fetchDashboard(): Promise<WorkspaceDashboardResponse> {
    return this.response;
  }
}
