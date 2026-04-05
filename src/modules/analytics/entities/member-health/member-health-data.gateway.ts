import { type MemberHealthCycleSnapshot } from './member-health.schema.js';

export abstract class MemberHealthDataGateway {
  abstract getMemberCycleSnapshots(
    teamId: string,
    memberName: string,
    cycleLimit: number,
  ): Promise<MemberHealthCycleSnapshot[]>;
}
