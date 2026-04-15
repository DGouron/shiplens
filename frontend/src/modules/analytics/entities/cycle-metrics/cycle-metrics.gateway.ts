import { type CycleMetricsResponse } from './cycle-metrics.response.ts';

export interface FetchCycleMetricsParams {
  teamId: string;
  cycleId: string;
}

export abstract class CycleMetricsGateway {
  abstract fetchCycleMetrics(
    params: FetchCycleMetricsParams,
  ): Promise<CycleMetricsResponse>;
}
