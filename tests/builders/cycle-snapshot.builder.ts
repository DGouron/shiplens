import { EntityBuilder } from '@shared/foundation/testing/entity-builder.js';
import { CycleSnapshot } from '@modules/analytics/entities/cycle-snapshot/cycle-snapshot.js';
import { type CycleSnapshotProps, type CycleIssue } from '@modules/analytics/entities/cycle-snapshot/cycle-snapshot.schema.js';

const defaultProps: CycleSnapshotProps = {
  cycleId: 'cycle-1',
  teamId: 'team-1',
  cycleName: 'Sprint 10',
  startsAt: '2026-01-01T00:00:00Z',
  endsAt: '2026-01-14T00:00:00Z',
  issues: [
    {
      externalId: 'issue-1',
      title: 'Default Issue',
      statusName: 'Done',
      points: 3,
      createdAt: '2026-01-01T00:00:00Z',
      completedAt: '2026-01-10T00:00:00Z',
      startedAt: '2026-01-05T00:00:00Z',
    },
  ],
};

export class CycleSnapshotBuilder extends EntityBuilder<
  CycleSnapshotProps,
  CycleSnapshot
> {
  constructor() {
    super(defaultProps);
  }

  withCycleId(cycleId: string): this {
    this.props.cycleId = cycleId;
    return this;
  }

  withTeamId(teamId: string): this {
    this.props.teamId = teamId;
    return this;
  }

  withCycleName(cycleName: string): this {
    this.props.cycleName = cycleName;
    return this;
  }

  withStartsAt(startsAt: string): this {
    this.props.startsAt = startsAt;
    return this;
  }

  withEndsAt(endsAt: string): this {
    this.props.endsAt = endsAt;
    return this;
  }

  withIssues(issues: CycleIssue[]): this {
    this.props.issues = issues;
    return this;
  }

  build(): CycleSnapshot {
    return CycleSnapshot.create({ ...this.props });
  }
}
