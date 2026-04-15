import { type WorkspaceDashboardResponse } from './workspace-dashboard.response.ts';

export abstract class WorkspaceDashboardGateway {
  abstract fetchDashboard(): Promise<WorkspaceDashboardResponse>;
}
