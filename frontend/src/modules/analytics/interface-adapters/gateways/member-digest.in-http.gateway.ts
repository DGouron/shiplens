import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import {
  type GenerateMemberDigestParams,
  MemberDigestGateway,
} from '../../entities/member-digest/member-digest.gateway.ts';
import { type MemberDigestResponse } from '../../entities/member-digest/member-digest.response.ts';
import { memberDigestPaths } from '../url-contracts/member-digest.url-contract.ts';
import { memberDigestResponseGuard } from './member-digest.response.guard.ts';

const HARDCODED_AI_PROVIDER = 'Anthropic';

export class MemberDigestInHttpGateway extends MemberDigestGateway {
  async generate(
    params: GenerateMemberDigestParams,
  ): Promise<MemberDigestResponse> {
    const response = await fetch(memberDigestPaths.generate(params.cycleId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teamId: params.teamId,
        memberName: params.memberName,
        provider: HARDCODED_AI_PROVIDER,
      }),
    });
    if (!response.ok) {
      throw new GatewayError(
        `Failed to generate member digest: HTTP ${response.status}`,
      );
    }
    const payload: unknown = await response.json();
    const parsed = memberDigestResponseGuard.safeParse(payload);
    if (!parsed.success) {
      throw new GatewayError(
        `Invalid member digest payload: ${parsed.error.message}`,
      );
    }
    return parsed.data;
  }
}
