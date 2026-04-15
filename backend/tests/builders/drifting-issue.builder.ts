import { DriftingIssue } from '@modules/analytics/entities/drifting-issue/drifting-issue.js';
import { type DriftingIssueInput } from '@modules/analytics/entities/drifting-issue/drifting-issue.schema.js';
import { EntityBuilder } from '@shared/foundation/testing/entity-builder.js';

const PARIS = 'Europe/Paris';

const defaultProps: DriftingIssueInput = {
  issueExternalId: 'ISSUE-1',
  issueTitle: 'Fix login bug',
  issueUuid: 'uuid-1',
  teamId: 'team-1',
  points: 1,
  statusName: 'In Review',
  statusType: 'started',
  startedAt: '2026-04-06T07:00:00Z',
  assigneeName: null,
};

export class DriftingIssueBuilder extends EntityBuilder<
  DriftingIssueInput,
  DriftingIssue
> {
  private now: string = '2026-04-06T15:00:00Z';
  private timezone: string = PARIS;

  constructor() {
    super(defaultProps);
  }

  withIssueExternalId(issueExternalId: string): this {
    this.props.issueExternalId = issueExternalId;
    return this;
  }

  withIssueTitle(issueTitle: string): this {
    this.props.issueTitle = issueTitle;
    return this;
  }

  withIssueUuid(issueUuid: string): this {
    this.props.issueUuid = issueUuid;
    return this;
  }

  withTeamId(teamId: string): this {
    this.props.teamId = teamId;
    return this;
  }

  withPoints(points: number | null): this {
    this.props.points = points;
    return this;
  }

  withStatusName(statusName: string): this {
    this.props.statusName = statusName;
    return this;
  }

  withStatusType(statusType: string): this {
    this.props.statusType = statusType;
    return this;
  }

  withStartedAt(startedAt: string | null): this {
    this.props.startedAt = startedAt;
    return this;
  }

  withAssigneeName(assigneeName: string | null): this {
    this.props.assigneeName = assigneeName;
    return this;
  }

  withNow(now: string): this {
    this.now = now;
    return this;
  }

  withTimezone(timezone: string): this {
    this.timezone = timezone;
    return this;
  }

  build(): DriftingIssue {
    const result = DriftingIssue.analyze(
      { ...this.props },
      this.now,
      this.timezone,
    );
    if (!result) {
      throw new Error(
        'DriftingIssueBuilder produced a null DriftingIssue — adjust props so analyze() yields a result',
      );
    }
    return result;
  }
}
