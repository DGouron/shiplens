import { type DriftingIssueResponse } from '@/modules/analytics/entities/drifting-issues/drifting-issues.response.ts';
import { EntityBuilder } from '@/shared/foundation/testing/entity-builder.ts';

export class DriftingIssueResponseBuilder extends EntityBuilder<
  DriftingIssueResponse,
  DriftingIssueResponse
> {
  constructor() {
    super({
      issueExternalId: 'LIN-100',
      issueTitle: 'Sample drifting issue',
      teamId: 'team-1',
      statusName: 'In Progress',
      points: 3,
      driftStatus: 'drifting',
      elapsedBusinessHours: 72,
      expectedMaxHours: 24,
      issueUrl: 'https://linear.app/issue/drift-1',
    });
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

  withPoints(points: number | null): this {
    this.props.points = points;
    return this;
  }

  withDriftStatus(driftStatus: string): this {
    this.props.driftStatus = driftStatus;
    return this;
  }

  withElapsedBusinessHours(elapsedBusinessHours: number): this {
    this.props.elapsedBusinessHours = elapsedBusinessHours;
    return this;
  }

  withExpectedMaxHours(expectedMaxHours: number | null): this {
    this.props.expectedMaxHours = expectedMaxHours;
    return this;
  }

  withIssueUrl(issueUrl: string): this {
    this.props.issueUrl = issueUrl;
    return this;
  }

  build(): DriftingIssueResponse {
    return { ...this.props };
  }
}
