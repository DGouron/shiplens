import {
  type MemberCycleContext,
  MemberDigestDataGateway,
} from '../../entities/member-digest/member-digest-data.gateway.js';

export class StubMemberDigestDataGateway extends MemberDigestDataGateway {
  context: MemberCycleContext = {
    memberName: 'Alice',
    cycleName: 'Sprint 42',
    issues: [
      {
        title: 'Fix login bug',
        statusName: 'In Progress',
        points: 3,
        timeInCurrentStatusHours: 48,
      },
      {
        title: 'Add tests',
        statusName: 'In Review',
        points: 2,
        timeInCurrentStatusHours: 12,
      },
      {
        title: 'Deploy feature',
        statusName: 'Done',
        points: 5,
        timeInCurrentStatusHours: 0,
      },
    ],
    blockedIssues: [
      { title: 'Fix login bug', statusName: 'In Progress', durationHours: 48 },
    ],
  };

  async getMemberCycleContext(
    _cycleId: string,
    _teamId: string,
    _memberName: string,
  ): Promise<MemberCycleContext> {
    return this.context;
  }
}
