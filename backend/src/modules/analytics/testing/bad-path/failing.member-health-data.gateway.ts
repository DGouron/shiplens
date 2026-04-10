import { GatewayError } from '@shared/foundation/gateway-error.js';
import { type MemberHealthCycleSnapshot } from '../../entities/member-health/member-health.schema.js';
import { MemberHealthDataGateway } from '../../entities/member-health/member-health-data.gateway.js';

export class FailingMemberHealthDataGateway extends MemberHealthDataGateway {
  async getMemberCycleSnapshots(): Promise<MemberHealthCycleSnapshot[]> {
    throw new GatewayError(
      'Gateway error: unable to fetch member health snapshots',
    );
  }
}
