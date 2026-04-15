import { type WorkspaceDashboardDto } from './workspace-dashboard.dto.ts';

export abstract class WorkspaceDashboardGateway {
  abstract fetchDashboard(): Promise<WorkspaceDashboardDto>;
}
