import { type TopCycleThemeRowResponse } from '@/modules/analytics/entities/top-cycle-themes/top-cycle-themes.response.ts';
import { EntityBuilder } from '@/shared/foundation/testing/entity-builder.ts';

export class TopCycleThemeRowResponseBuilder extends EntityBuilder<
  TopCycleThemeRowResponse,
  TopCycleThemeRowResponse
> {
  constructor() {
    super({
      name: 'Auth refactor',
      issueCount: 1,
      totalPoints: 0,
      totalCycleTimeInHours: 0,
    });
  }

  withName(name: string): this {
    this.props.name = name;
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

  build(): TopCycleThemeRowResponse {
    return { ...this.props };
  }
}
