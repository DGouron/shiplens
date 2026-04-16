import {
  type CycleMetricsResponse,
  type VelocityResponse,
} from '@/modules/analytics/entities/cycle-metrics/cycle-metrics.response.ts';
import { EntityBuilder } from '@/shared/foundation/testing/entity-builder.ts';

export class CycleMetricsResponseBuilder extends EntityBuilder<
  CycleMetricsResponse,
  CycleMetricsResponse
> {
  constructor() {
    super({
      velocity: { completedPoints: 5, plannedPoints: 10 },
      throughput: 7,
      completionRate: 50,
      scopeCreep: 3,
      averageCycleTimeInDays: 2.6,
      averageLeadTimeInDays: 4.2,
    });
  }

  withVelocity(velocity: VelocityResponse): this {
    this.props.velocity = { ...velocity };
    return this;
  }

  withThroughput(throughput: number): this {
    this.props.throughput = throughput;
    return this;
  }

  withCompletionRate(completionRate: number): this {
    this.props.completionRate = completionRate;
    return this;
  }

  withScopeCreep(scopeCreep: number): this {
    this.props.scopeCreep = scopeCreep;
    return this;
  }

  withAverageCycleTimeInDays(averageCycleTimeInDays: number | null): this {
    this.props.averageCycleTimeInDays = averageCycleTimeInDays;
    return this;
  }

  withAverageLeadTimeInDays(averageLeadTimeInDays: number | null): this {
    this.props.averageLeadTimeInDays = averageLeadTimeInDays;
    return this;
  }

  withTrend(previousVelocities: number[]): this {
    this.props.trend = { previousVelocities: [...previousVelocities] };
    return this;
  }

  build(): CycleMetricsResponse {
    const copy: CycleMetricsResponse = {
      velocity: { ...this.props.velocity },
      throughput: this.props.throughput,
      completionRate: this.props.completionRate,
      scopeCreep: this.props.scopeCreep,
      averageCycleTimeInDays: this.props.averageCycleTimeInDays,
      averageLeadTimeInDays: this.props.averageLeadTimeInDays,
    };
    if (this.props.trend !== undefined) {
      copy.trend = {
        previousVelocities: [...this.props.trend.previousVelocities],
      };
    }
    return copy;
  }
}
