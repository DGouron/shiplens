import { Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(CalculateEstimationAccuracyUsecase.name);

  constructor(
    private readonly estimationAccuracyDataGateway: EstimationAccuracyDataGateway,
  ) {}

  async execute(params: CalculateEstimationAccuracyParams): Promise<EstimationAccuracy> {
    this.logger.log(`[${params.cycleId}] Estimation accuracy calculation started`);

    const data = await this.estimationAccuracyDataGateway.getEstimationData(
      params.cycleId,
      params.teamId,
    );

    const result = EstimationAccuracy.create(data);
    const teamScore = result.teamScore();

    this.logger.log(`[${params.cycleId}] Estimation accuracy calculated — issues: ${teamScore.issueCount}, team score: ${teamScore.classification}`);

    return result;
  }
}
