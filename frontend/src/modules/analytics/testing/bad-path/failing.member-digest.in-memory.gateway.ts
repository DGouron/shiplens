import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { MemberDigestGateway } from '../../entities/member-digest/member-digest.gateway.ts';

export class FailingMemberDigestGateway extends MemberDigestGateway {
  async generate(): Promise<never> {
    throw new GatewayError('Failed to generate member digest');
  }
}
