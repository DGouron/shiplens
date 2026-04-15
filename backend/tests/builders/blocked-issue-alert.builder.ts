import { BlockedIssueAlert } from '@modules/analytics/entities/blocked-issue-alert/blocked-issue-alert.js';
import { type BlockedIssueAlertProps } from '@modules/analytics/entities/blocked-issue-alert/blocked-issue-alert.schema.js';
import { EntityBuilder } from '@shared/foundation/testing/entity-builder.js';

const defaultProps: BlockedIssueAlertProps = {
  id: 'alert-1',
  issueExternalId: 'issue-1',
  issueTitle: 'Fix login bug',
  issueUuid: 'uuid-1',
  teamId: 'team-1',
  statusName: 'In Review',
  severity: 'warning',
  durationHours: 50,
  detectedAt: '2026-01-15T12:00:00Z',
  active: true,
  resolvedAt: null,
  assigneeName: null,
};

export class BlockedIssueAlertBuilder extends EntityBuilder<
  BlockedIssueAlertProps,
  BlockedIssueAlert
> {
  constructor() {
    super(defaultProps);
  }

  withId(id: string): this {
    this.props.id = id;
    return this;
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

  withStatusName(statusName: string): this {
    this.props.statusName = statusName;
    return this;
  }

  withSeverity(severity: 'warning' | 'critical'): this {
    this.props.severity = severity;
    return this;
  }

  withDurationHours(durationHours: number): this {
    this.props.durationHours = durationHours;
    return this;
  }

  withDetectedAt(detectedAt: string): this {
    this.props.detectedAt = detectedAt;
    return this;
  }

  withActive(active: boolean): this {
    this.props.active = active;
    return this;
  }

  withResolvedAt(resolvedAt: string | null): this {
    this.props.resolvedAt = resolvedAt;
    return this;
  }

  withAssigneeName(assigneeName: string | null): this {
    this.props.assigneeName = assigneeName;
    return this;
  }

  build(): BlockedIssueAlert {
    return BlockedIssueAlert.create({ ...this.props });
  }
}
