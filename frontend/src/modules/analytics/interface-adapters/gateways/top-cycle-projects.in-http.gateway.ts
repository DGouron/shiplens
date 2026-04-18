import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { TopCycleProjectsGateway } from '../../entities/top-cycle-projects/top-cycle-projects.gateway.ts';
import {
  type CycleProjectIssuesResponse,
  type TopCycleProjectsResponse,
} from '../../entities/top-cycle-projects/top-cycle-projects.response.ts';
import {
  cycleProjectIssuesResponseGuard,
  topCycleProjectsResponseGuard,
} from './top-cycle-projects.response.guard.ts';

export class TopCycleProjectsInHttpGateway extends TopCycleProjectsGateway {
  async fetchTopCycleProjects(params: {
    teamId: string;
  }): Promise<TopCycleProjectsResponse> {
    const response = await fetch(
      `/analytics/top-cycle-projects/${encodeURIComponent(params.teamId)}`,
    );
    if (!response.ok) {
      throw new GatewayError(
        `Failed to fetch top cycle projects: HTTP ${response.status}`,
      );
    }
    const payload: unknown = await response.json();
    const parsed = topCycleProjectsResponseGuard.safeParse(payload);
    if (!parsed.success) {
      throw new GatewayError(
        `Invalid top cycle projects response payload: ${parsed.error.message}`,
      );
    }
    return parsed.data;
  }

  async fetchCycleProjectIssues(params: {
    teamId: string;
    projectId: string;
  }): Promise<CycleProjectIssuesResponse> {
    const url =
      `/analytics/top-cycle-projects/${encodeURIComponent(params.teamId)}` +
      `/projects/${encodeURIComponent(params.projectId)}/issues`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new GatewayError(
        `Failed to fetch cycle project issues: HTTP ${response.status}`,
      );
    }
    const payload: unknown = await response.json();
    const parsed = cycleProjectIssuesResponseGuard.safeParse(payload);
    if (!parsed.success) {
      throw new GatewayError(
        `Invalid cycle project issues response payload: ${parsed.error.message}`,
      );
    }
    return parsed.data;
  }
}
