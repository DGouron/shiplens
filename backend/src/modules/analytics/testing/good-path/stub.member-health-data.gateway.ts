import { type MemberHealthCycleSnapshot } from '../../entities/member-health/member-health.schema.js';
import { MemberHealthDataGateway } from '../../entities/member-health/member-health-data.gateway.js';

export class StubMemberHealthDataGateway extends MemberHealthDataGateway {
  cycleSnapshots: MemberHealthCycleSnapshot[] = [];

  async getMemberCycleSnapshots(
    _teamId: string,
    _memberName: string,
    _cycleLimit: number,
    _startedStatuses?: readonly string[],
    _completedStatuses?: readonly string[],
  ): Promise<MemberHealthCycleSnapshot[]> {
    return this.cycleSnapshots;
  }
}
