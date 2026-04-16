import {
  BottleneckAnalysisGateway,
  type FetchBottleneckAnalysisParams,
} from '../../entities/bottleneck-analysis/bottleneck-analysis.gateway.ts';
import { type BottleneckAnalysisResponse } from '../../entities/bottleneck-analysis/bottleneck-analysis.response.ts';

interface StubBottleneckAnalysisGatewayOptions {
  response?: BottleneckAnalysisResponse;
  responsesByCycleId?: Record<string, BottleneckAnalysisResponse>;
}

const defaultResponse: BottleneckAnalysisResponse = {
  statusDistribution: [
    { statusName: 'In Progress', medianHours: 12 },
    { statusName: 'In Review', medianHours: 30 },
  ],
  bottleneckStatus: 'In Review',
  assigneeBreakdown: [],
  cycleComparison: null,
};

export class StubBottleneckAnalysisGateway extends BottleneckAnalysisGateway {
  private readonly response: BottleneckAnalysisResponse;
  private readonly responsesByCycleId: Record<
    string,
    BottleneckAnalysisResponse
  >;
  calls: FetchBottleneckAnalysisParams[] = [];

  constructor(options: StubBottleneckAnalysisGatewayOptions = {}) {
    super();
    this.response = options.response ?? defaultResponse;
    this.responsesByCycleId = options.responsesByCycleId ?? {};
  }

  async fetchBottleneckAnalysis(
    params: FetchBottleneckAnalysisParams,
  ): Promise<BottleneckAnalysisResponse> {
    this.calls.push(params);
    return this.responsesByCycleId[params.cycleId] ?? this.response;
  }
}
