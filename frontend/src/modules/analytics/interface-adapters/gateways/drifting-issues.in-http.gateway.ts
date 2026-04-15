import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import {
  DriftingIssuesGateway,
  type FetchDriftingIssuesParams,
} from '../../entities/drifting-issues/drifting-issues.gateway.ts';
import { type DriftingIssuesResponse } from '../../entities/drifting-issues/drifting-issues.response.ts';
import { driftingIssueResponseGuard } from './drifting-issues.response.guard.ts';

export class DriftingIssuesInHttpGateway extends DriftingIssuesGateway {
  async fetchDriftingIssues(
    params: FetchDriftingIssuesParams,
  ): Promise<DriftingIssuesResponse> {
    const teamSegment = encodeURIComponent(params.teamId);
    const path = `/analytics/drifting-issues/${teamSegment}`;
    const response = await fetch(path);
    if (!response.ok) {
      throw new GatewayError(
        `Failed to fetch drifting issues: HTTP ${response.status}`,
      );
    }
    const payload: unknown = await response.json();
    const parsed = driftingIssueResponseGuard.safeParseCollection(payload);
    if (!parsed.success) {
      throw new GatewayError(
        `Invalid drifting issues response payload: ${parsed.error.message}`,
      );
    }
    return parsed.data;
  }
}
