import { type TopCycleProjectRowResponse } from '@/modules/analytics/entities/top-cycle-projects/top-cycle-projects.response.ts';
import { EntityBuilder } from '@/shared/foundation/testing/entity-builder.ts';

export class TopCycleProjectRowResponseBuilder extends EntityBuilder<
  TopCycleProjectRowResponse,
  TopCycleProjectRowResponse
> {
  constructor() {
    super({
      projectId: 'project-1',
      projectName: 'Project One',
      isNoProjectBucket: false,
      issueCount: 1,
      totalPoints: 0,
      totalCycleTimeInHours: 0,
    });
  }

  withProjectId(projectId: string): this {
    this.props.projectId = projectId;
    return this;
  }

  withProjectName(projectName: string): this {
    this.props.projectName = projectName;
    return this;
  }

  withIsNoProjectBucket(isNoProjectBucket: boolean): this {
    this.props.isNoProjectBucket = isNoProjectBucket;
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

  build(): TopCycleProjectRowResponse {
    return { ...this.props };
  }
}
