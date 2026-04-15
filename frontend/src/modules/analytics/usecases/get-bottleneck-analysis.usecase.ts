import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import {
  type BottleneckAnalysisGateway,
  type FetchBottleneckAnalysisParams,
} from '../entities/bottleneck-analysis/bottleneck-analysis.gateway.ts';
import { type BottleneckAnalysisResponse } from '../entities/bottleneck-analysis/bottleneck-analysis.response.ts';

export class GetBottleneckAnalysisUsecase
  implements Usecase<FetchBottleneckAnalysisParams, BottleneckAnalysisResponse>
{
  constructor(private readonly gateway: BottleneckAnalysisGateway) {}

  async execute(
    params: FetchBottleneckAnalysisParams,
  ): Promise<BottleneckAnalysisResponse> {
    return this.gateway.fetchBottleneckAnalysis(params);
  }
}
