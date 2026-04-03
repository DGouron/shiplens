export interface MemberCycleContext {
  memberName: string;
  cycleName: string;
  issues: Array<{
    title: string;
    statusName: string;
    points: number | null;
    timeInCurrentStatusHours: number;
  }>;
  blockedIssues: Array<{
    title: string;
    statusName: string;
    durationHours: number;
  }>;
}

export abstract class MemberDigestDataGateway {
  abstract getMemberCycleContext(
    cycleId: string,
    teamId: string,
    memberName: string,
  ): Promise<MemberCycleContext>;
}
