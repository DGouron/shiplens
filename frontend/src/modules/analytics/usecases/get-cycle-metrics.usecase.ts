import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import {
  type CycleMetricsGateway,
  type FetchCycleMetricsParams,
} from '../entities/cycle-metrics/cycle-metrics.gateway.ts';
import { type CycleMetricsResponse } from '../entities/cycle-metrics/cycle-metrics.response.ts';

export class GetCycleMetricsUsecase
  implements Usecase<FetchCycleMetricsParams, CycleMetricsResponse>
{
  constructor(private readonly gateway: CycleMetricsGateway) {}

  async execute(
    params: FetchCycleMetricsParams,
  ): Promise<CycleMetricsResponse> {
    return this.gateway.fetchCycleMetrics(params);
  }
}
