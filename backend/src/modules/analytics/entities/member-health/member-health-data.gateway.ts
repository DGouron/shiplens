import { type MemberHealthCycleSnapshot } from './member-health.schema.js';

export abstract class MemberHealthDataGateway {
  abstract getMemberCycleSnapshots(
    teamId: string,
    memberName: string,
    cycleLimit: number,
    startedStatuses: readonly string[],
    completedStatuses: readonly string[],
  ): Promise<MemberHealthCycleSnapshot[]>;
}
