import { type CycleThemeIssueRowResponse } from '@/modules/analytics/entities/top-cycle-themes/top-cycle-themes.response.ts';
import { EntityBuilder } from '@/shared/foundation/testing/entity-builder.ts';

export class CycleThemeIssueRowResponseBuilder extends EntityBuilder<
  CycleThemeIssueRowResponse,
  CycleThemeIssueRowResponse
> {
  constructor() {
    super({
      externalId: 'LIN-1',
      title: 'Sample issue',
      assigneeName: null,
      points: null,
      statusName: 'Done',
      linearUrl: null,
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

  withLinearUrl(linearUrl: string | null): this {
    this.props.linearUrl = linearUrl;
    return this;
  }

  build(): CycleThemeIssueRowResponse {
    return { ...this.props };
  }
}
