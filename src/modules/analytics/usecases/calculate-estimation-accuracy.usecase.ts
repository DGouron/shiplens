import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { EstimationAccuracyDataGateway } from '../entities/estimation-accuracy/estimation-accuracy-data.gateway.js';
import { EstimationAccuracy } from '../entities/estimation-accuracy/estimation-accuracy.js';

interface CalculateEstimationAccuracyParams {
  cycleId: string;
  teamId: string;
}

@Injectable()
export class CalculateEstimationAccuracyUsecase
  implements Usecase<CalculateEstimationAccuracyParams, EstimationAccuracy>
{
  constructor(
    private readonly estimationAccuracyDataGateway: EstimationAccuracyDataGateway,
  ) {}

  async execute(params: CalculateEstimationAccuracyParams): Promise<EstimationAccuracy> {
    const data = await this.estimationAccuracyDataGateway.getEstimationData(
      params.cycleId,
      params.teamId,
    );

    return EstimationAccuracy.create(data);
  }
}
