import { MemberHealth } from '@modules/analytics/entities/member-health/member-health.js';
import {
  type MemberHealthCycleSnapshot,
  type MemberHealthProps,
} from '@modules/analytics/entities/member-health/member-health.schema.js';
import { EntityBuilder } from '@shared/foundation/testing/entity-builder.js';

const defaultProps: MemberHealthProps = {
  teamId: 'team-1',
  memberName: 'Alice',
  cycleSnapshots: [],
};

export class MemberHealthBuilder extends EntityBuilder<
  MemberHealthProps,
  MemberHealth
> {
  constructor() {
    super(defaultProps);
  }

  withTeamId(teamId: string): this {
    this.props.teamId = teamId;
    return this;
  }

  withMemberName(memberName: string): this {
    this.props.memberName = memberName;
    return this;
  }

  withCycleSnapshots(snapshots: MemberHealthCycleSnapshot[]): this {
    this.props.cycleSnapshots = snapshots;
    return this;
  }

  build(): MemberHealth {
    return MemberHealth.create({ ...this.props });
  }
}
