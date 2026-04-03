import { Injectable, Logger } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { DurationPredictionDataGateway } from '../entities/duration-prediction/duration-prediction-data.gateway.js';
import { DurationPrediction } from '../entities/duration-prediction/duration-prediction.js';
import { InsufficientHistoryError } from '../entities/duration-prediction/duration-prediction.errors.js';
import { NoSimilarIssuesError } from '../entities/duration-prediction/duration-prediction.errors.js';

interface PredictIssueDurationParams {
  teamId: string;
  issueExternalId: string;
}

const MINIMUM_COMPLETED_CYCLES = 2;

@Injectable()
export class PredictIssueDurationUsecase
  implements Usecase<PredictIssueDurationParams, DurationPrediction>
{
  private readonly logger = new Logger(PredictIssueDurationUsecase.name);

  constructor(
    private readonly durationPredictionDataGateway: DurationPredictionDataGateway,
  ) {}

  async execute(params: PredictIssueDurationParams): Promise<DurationPrediction> {
    this.logger.log(`[${params.issueExternalId}] Duration prediction started`);

    const completedCycleCount = await this.durationPredictionDataGateway.getCompletedCycleCount(
      params.teamId,
    );

    if (completedCycleCount < MINIMUM_COMPLETED_CYCLES) {
      throw new InsufficientHistoryError();
    }

    const cycleTimes = await this.durationPredictionDataGateway.getSimilarIssuesCycleTimes(
      params.teamId,
      params.issueExternalId,
    );

    if (cycleTimes.length === 0) {
      throw new NoSimilarIssuesError();
    }

    const prediction = DurationPrediction.fromCycleTimes(cycleTimes);

    this.logger.log(`[${params.issueExternalId}] Duration predicted — probable: ${prediction.probable}d, confidence: ${prediction.confidence}, similar issues: ${prediction.similarIssueCount}`);

    return prediction;
  }
}
