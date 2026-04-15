import { type WorkspaceDashboardDto } from '../../entities/workspace-dashboard/workspace-dashboard.dto.ts';
import { WorkspaceDashboardGateway } from '../../entities/workspace-dashboard/workspace-dashboard.gateway.ts';

interface StubWorkspaceDashboardGatewayOptions {
  response?: WorkspaceDashboardDto;
}

const defaultResponse: WorkspaceDashboardDto = {
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
  private readonly response: WorkspaceDashboardDto;

  constructor(options: StubWorkspaceDashboardGatewayOptions = {}) {
    super();
    this.response = options.response ?? defaultResponse;
  }

  async fetchDashboard(): Promise<WorkspaceDashboardDto> {
    return this.response;
  }
}
