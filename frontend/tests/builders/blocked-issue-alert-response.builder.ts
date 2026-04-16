import { type BlockedIssueAlertResponse } from '@/modules/analytics/entities/blocked-issues/blocked-issues.response.ts';
import { EntityBuilder } from '@/shared/foundation/testing/entity-builder.ts';

export class BlockedIssueAlertResponseBuilder extends EntityBuilder<
  BlockedIssueAlertResponse,
  BlockedIssueAlertResponse
> {
  constructor() {
    super({
      id: 'alert-1',
      issueExternalId: 'LIN-42',
      issueTitle: 'Sample blocked issue',
      teamId: 'team-1',
      statusName: 'In Review',
      severity: 'warning',
      durationHours: 48,
      issueUrl: 'https://linear.app/issue/uuid-1',
      detectedAt: '2025-01-01T00:00:00.000Z',
      assigneeName: null,
    });
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

  withTeamId(teamId: string): this {
    this.props.teamId = teamId;
    return this;
  }

  withStatusName(statusName: string): this {
    this.props.statusName = statusName;
    return this;
  }

  withSeverity(severity: string): this {
    this.props.severity = severity;
    return this;
  }

  withDurationHours(durationHours: number): this {
    this.props.durationHours = durationHours;
    return this;
  }

  withIssueUrl(issueUrl: string): this {
    this.props.issueUrl = issueUrl;
    return this;
  }

  withDetectedAt(detectedAt: string): this {
    this.props.detectedAt = detectedAt;
    return this;
  }

  withAssigneeName(assigneeName: string | null): this {
    this.props.assigneeName = assigneeName;
    return this;
  }

  build(): BlockedIssueAlertResponse {
    return { ...this.props };
  }
}
