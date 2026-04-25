import {
  type AssigneeBreakdownResponse,
  type BottleneckAnalysisResponse,
  type StatusDistributionResponse,
} from '@/modules/analytics/entities/bottleneck-analysis/bottleneck-analysis.response.ts';
import { EntityBuilder } from '@/shared/foundation/testing/entity-builder.ts';

export class BottleneckAnalysisResponseBuilder extends EntityBuilder<
  BottleneckAnalysisResponse,
  BottleneckAnalysisResponse
> {
  constructor() {
    super({
      statusDistribution: [
        { statusName: 'In Progress', medianHours: 12 },
        { statusName: 'In Review', medianHours: 30 },
      ],
      bottleneckStatus: 'In Review',
      assigneeBreakdown: [],
      cycleComparison: null,
    });
  }

  withStatusDistribution(distribution: StatusDistributionResponse[]): this {
    this.props.statusDistribution = distribution.map((entry) => ({ ...entry }));
    return this;
  }

  withBottleneckStatus(bottleneckStatus: string): this {
    this.props.bottleneckStatus = bottleneckStatus;
    return this;
  }

  withAssigneeBreakdown(breakdown: AssigneeBreakdownResponse[]): this {
    this.props.assigneeBreakdown = breakdown.map((entry) => ({
      assigneeName: entry.assigneeName,
      statusMedians: entry.statusMedians.map((median) => ({ ...median })),
    }));
    return this;
  }

  build(): BottleneckAnalysisResponse {
    return {
      statusDistribution: this.props.statusDistribution.map((entry) => ({
        ...entry,
      })),
      bottleneckStatus: this.props.bottleneckStatus,
      assigneeBreakdown: this.props.assigneeBreakdown.map((entry) => ({
        assigneeName: entry.assigneeName,
        statusMedians: entry.statusMedians.map((median) => ({ ...median })),
      })),
      cycleComparison: null,
    };
  }
}
