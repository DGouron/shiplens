import { GatewayError } from '@shared/foundation/gateway-error.js';
import {
  type MemberCycleContext,
  MemberDigestDataGateway,
} from '../../entities/member-digest/member-digest-data.gateway.js';

export class FailingMemberDigestDataGateway extends MemberDigestDataGateway {
  async getMemberCycleContext(
    _cycleId: string,
    _teamId: string,
    _memberName: string,
  ): Promise<MemberCycleContext> {
    throw new GatewayError('Database error');
  }
}
