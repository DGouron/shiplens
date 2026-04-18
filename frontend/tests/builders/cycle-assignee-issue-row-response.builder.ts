import { type CycleAssigneeIssueRowResponse } from '@/modules/analytics/entities/top-cycle-assignees/top-cycle-assignees.response.ts';
import { EntityBuilder } from '@/shared/foundation/testing/entity-builder.ts';

export class CycleAssigneeIssueRowResponseBuilder extends EntityBuilder<
  CycleAssigneeIssueRowResponse,
  CycleAssigneeIssueRowResponse
> {
  constructor() {
    super({
      externalId: 'LIN-1',
      title: 'Sample issue',
      points: null,
      totalCycleTimeInHours: null,
      statusName: 'Done',
    });
  }

  withExternalId(externalId: string): this {
    this.props.externalId = externalId;
    return this;
  }

  withTitle(title: string): this {
    this.props.title = title;
    return this;
  }

  withPoints(points: number | null): this {
    this.props.points = points;
    return this;
  }

  withTotalCycleTimeInHours(totalCycleTimeInHours: number | null): this {
    this.props.totalCycleTimeInHours = totalCycleTimeInHours;
    return this;
  }

  withStatusName(statusName: string): this {
    this.props.statusName = statusName;
    return this;
  }

  build(): CycleAssigneeIssueRowResponse {
    return { ...this.props };
  }
}
