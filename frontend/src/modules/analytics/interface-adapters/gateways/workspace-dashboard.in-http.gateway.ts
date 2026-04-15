import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { type WorkspaceDashboardDto } from '../../entities/workspace-dashboard/workspace-dashboard.dto.ts';
import { WorkspaceDashboardGateway } from '../../entities/workspace-dashboard/workspace-dashboard.gateway.ts';
import { workspaceDashboardResponseGuard } from './workspace-dashboard.dto.guard.ts';

export class WorkspaceDashboardInHttpGateway extends WorkspaceDashboardGateway {
  async fetchDashboard(): Promise<WorkspaceDashboardDto> {
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
