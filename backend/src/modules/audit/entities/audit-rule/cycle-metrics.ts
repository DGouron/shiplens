export interface CycleMetrics {
  averageCycleTimeInDays: number;
  averageLeadTimeInDays: number;
  throughput: number;
  completionRate: number;
  scopeCreep: number;
  velocity: number;
  labelDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
  metricRatios: Record<string, number>;
}
