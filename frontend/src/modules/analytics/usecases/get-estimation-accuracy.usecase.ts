import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import {
  type EstimationAccuracyGateway,
  type FetchEstimationAccuracyParams,
} from '../entities/estimation-accuracy/estimation-accuracy.gateway.ts';
import { type EstimationAccuracyResponse } from '../entities/estimation-accuracy/estimation-accuracy.response.ts';

export class GetEstimationAccuracyUsecase
  implements Usecase<FetchEstimationAccuracyParams, EstimationAccuracyResponse>
{
  constructor(private readonly gateway: EstimationAccuracyGateway) {}

  async execute(
    params: FetchEstimationAccuracyParams,
  ): Promise<EstimationAccuracyResponse> {
    return this.gateway.fetchEstimationAccuracy(params);
  }
}
