import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { TopCycleAssigneesGateway } from '../../entities/top-cycle-assignees/top-cycle-assignees.gateway.ts';
import {
  type CycleAssigneeIssuesResponse,
  type TopCycleAssigneesResponse,
} from '../../entities/top-cycle-assignees/top-cycle-assignees.response.ts';
import {
  cycleAssigneeIssuesResponseGuard,
  topCycleAssigneesResponseGuard,
} from './top-cycle-assignees.response.guard.ts';

export class TopCycleAssigneesInHttpGateway extends TopCycleAssigneesGateway {
  async fetchTopCycleAssignees(params: {
    teamId: string;
  }): Promise<TopCycleAssigneesResponse> {
    const response = await fetch(
      `/analytics/top-cycle-assignees/${encodeURIComponent(params.teamId)}`,
    );
    if (!response.ok) {
      throw new GatewayError(
        `Failed to fetch top cycle assignees: HTTP ${response.status}`,
      );
    }
    const payload: unknown = await response.json();
    const parsed = topCycleAssigneesResponseGuard.safeParse(payload);
    if (!parsed.success) {
      throw new GatewayError(
        `Invalid top cycle assignees response payload: ${parsed.error.message}`,
      );
    }
    return parsed.data;
  }

  async fetchCycleAssigneeIssues(params: {
    teamId: string;
    assigneeName: string;
  }): Promise<CycleAssigneeIssuesResponse> {
    const url =
      `/analytics/top-cycle-assignees/${encodeURIComponent(params.teamId)}` +
      `/assignees/${encodeURIComponent(params.assigneeName)}/issues`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new GatewayError(
        `Failed to fetch cycle assignee issues: HTTP ${response.status}`,
      );
    }
    const payload: unknown = await response.json();
    const parsed = cycleAssigneeIssuesResponseGuard.safeParse(payload);
    if (!parsed.success) {
      throw new GatewayError(
        `Invalid cycle assignee issues response payload: ${parsed.error.message}`,
      );
    }
    return parsed.data;
  }
}
