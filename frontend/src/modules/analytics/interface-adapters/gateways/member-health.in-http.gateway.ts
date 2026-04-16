import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import {
  type FetchMemberHealthParams,
  MemberHealthGateway,
} from '../../entities/member-health/member-health.gateway.ts';
import { type MemberHealthResponse } from '../../entities/member-health/member-health.response.ts';
import { memberHealthResponseGuard } from './member-health.response.guard.ts';

export class MemberHealthInHttpGateway extends MemberHealthGateway {
  async fetchMemberHealth(
    params: FetchMemberHealthParams,
  ): Promise<MemberHealthResponse | null> {
    const path = `/api/analytics/teams/${encodeURIComponent(params.teamId)}/members/${encodeURIComponent(params.memberName)}/health?cycles=${params.cycles}`;
    const response = await fetch(path);

    if (response.status === 422) {
      return null;
    }

    if (!response.ok) {
      throw new GatewayError(
        `Failed to fetch member health data: HTTP ${response.status}`,
      );
    }

    const payload: unknown = await response.json();
    const parsed = memberHealthResponseGuard.safeParse(payload);
    if (!parsed.success) {
      throw new GatewayError(
        `Invalid member health response payload: ${parsed.error.message}`,
      );
    }
    return parsed.data;
  }
}
