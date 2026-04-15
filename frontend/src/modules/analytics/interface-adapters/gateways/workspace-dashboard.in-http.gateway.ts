import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { WorkspaceDashboardGateway } from '../../entities/workspace-dashboard/workspace-dashboard.gateway.ts';
import { type WorkspaceDashboardResponse } from '../../entities/workspace-dashboard/workspace-dashboard.response.ts';
import { workspaceDashboardResponseGuard } from './workspace-dashboard.response.guard.ts';

export class WorkspaceDashboardInHttpGateway extends WorkspaceDashboardGateway {
  async fetchDashboard(): Promise<WorkspaceDashboardResponse> {
    const response = await fetch('/dashboard/data');
    if (!response.ok) {
      throw new GatewayError(
        `Failed to fetch dashboard: HTTP ${response.status}`,
      );
    }
    const payload: unknown = await response.json();
    const parsed = workspaceDashboardResponseGuard.safeParse(payload);
    if (!parsed.success) {
      throw new GatewayError(
        `Invalid dashboard response payload: ${parsed.error.message}`,
      );
    }
    return parsed.data;
  }
}
