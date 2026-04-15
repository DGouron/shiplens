import {
  CycleMetricsGateway,
  type FetchCycleMetricsParams,
} from '../../entities/cycle-metrics/cycle-metrics.gateway.ts';
import { type CycleMetricsResponse } from '../../entities/cycle-metrics/cycle-metrics.response.ts';

interface StubCycleMetricsGatewayOptions {
  response?: CycleMetricsResponse;
  responsesByCycleId?: Record<string, CycleMetricsResponse>;
}

const defaultResponse: CycleMetricsResponse = {
  velocity: { completedPoints: 5, plannedPoints: 10 },
  throughput: 7,
  completionRate: 50,
  scopeCreep: 3,
  averageCycleTimeInDays: 2.6,
  averageLeadTimeInDays: 4.2,
};

export class StubCycleMetricsGateway extends CycleMetricsGateway {
  private readonly response: CycleMetricsResponse;
  private readonly responsesByCycleId: Record<string, CycleMetricsResponse>;
  calls: FetchCycleMetricsParams[] = [];

  constructor(options: StubCycleMetricsGatewayOptions = {}) {
    super();
    this.response = options.response ?? defaultResponse;
    this.responsesByCycleId = options.responsesByCycleId ?? {};
  }

  async fetchCycleMetrics(
    params: FetchCycleMetricsParams,
  ): Promise<CycleMetricsResponse> {
    this.calls.push(params);
    return this.responsesByCycleId[params.cycleId] ?? this.response;
  }
}
