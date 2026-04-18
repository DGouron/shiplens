import { type TopCycleAssigneeRowResponse } from '@/modules/analytics/entities/top-cycle-assignees/top-cycle-assignees.response.ts';
import { EntityBuilder } from '@/shared/foundation/testing/entity-builder.ts';

export class TopCycleAssigneeRowResponseBuilder extends EntityBuilder<
  TopCycleAssigneeRowResponse,
  TopCycleAssigneeRowResponse
> {
  constructor() {
    super({
      assigneeName: 'Alice',
      issueCount: 1,
      totalPoints: 0,
      totalCycleTimeInHours: 0,
    });
  }

  withAssigneeName(assigneeName: string): this {
    this.props.assigneeName = assigneeName;
    return this;
  }

  withIssueCount(issueCount: number): this {
    this.props.issueCount = issueCount;
    return this;
  }

  withTotalPoints(totalPoints: number): this {
    this.props.totalPoints = totalPoints;
    return this;
  }

  withTotalCycleTimeInHours(totalCycleTimeInHours: number | null): this {
    this.props.totalCycleTimeInHours = totalCycleTimeInHours;
    return this;
  }

  build(): TopCycleAssigneeRowResponse {
    return { ...this.props };
  }
}
