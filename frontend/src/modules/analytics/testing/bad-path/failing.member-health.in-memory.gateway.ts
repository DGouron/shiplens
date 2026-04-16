import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { MemberHealthGateway } from '../../entities/member-health/member-health.gateway.ts';

export class FailingMemberHealthGateway extends MemberHealthGateway {
  async fetchMemberHealth(): Promise<never> {
    throw new GatewayError('Failed to fetch member health data');
  }
}
