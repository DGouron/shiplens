import { type CycleProjectIssueRowResponse } from '@/modules/analytics/entities/top-cycle-projects/top-cycle-projects.response.ts';
import { EntityBuilder } from '@/shared/foundation/testing/entity-builder.ts';

export class CycleProjectIssueRowResponseBuilder extends EntityBuilder<
  CycleProjectIssueRowResponse,
  CycleProjectIssueRowResponse
> {
  constructor() {
    super({
      externalId: 'LIN-1',
      title: 'Sample issue',
      assigneeName: null,
      points: null,
      statusName: 'Todo',
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

  withAssigneeName(assigneeName: string | null): this {
    this.props.assigneeName = assigneeName;
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

  build(): CycleProjectIssueRowResponse {
    return { ...this.props };
  }
}
