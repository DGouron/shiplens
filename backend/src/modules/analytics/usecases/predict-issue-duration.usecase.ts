import { Injectable, Logger } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import {
  InsufficientHistoryError,
  NoSimilarIssuesError,
} from '../entities/duration-prediction/duration-prediction.errors.js';
import { DurationPrediction } from '../entities/duration-prediction/duration-prediction.js';
import { DurationPredictionDataGateway } from '../entities/duration-prediction/duration-prediction-data.gateway.js';
import { ResolveWorkflowConfigUsecase } from './resolve-workflow-config.usecase.js';

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
    private readonly resolveWorkflowConfig: ResolveWorkflowConfigUsecase,
  ) {}

  async execute(
    params: PredictIssueDurationParams,
  ): Promise<DurationPrediction> {
    this.logger.log(`[${params.issueExternalId}] Duration prediction started`);

    const completedCycleCount =
      await this.durationPredictionDataGateway.getCompletedCycleCount(
        params.teamId,
      );

    if (completedCycleCount < MINIMUM_COMPLETED_CYCLES) {
      throw new InsufficientHistoryError();
    }

    const workflowConfig = await this.resolveWorkflowConfig.execute({
      teamId: params.teamId,
    });

    const cycleTimes =
      await this.durationPredictionDataGateway.getSimilarIssuesCycleTimes(
        params.teamId,
        params.issueExternalId,
        workflowConfig.startedStatuses,
        workflowConfig.completedStatuses,
      );

    if (cycleTimes.length === 0) {
      throw new NoSimilarIssuesError();
    }

    const prediction = DurationPrediction.fromCycleTimes(cycleTimes);

    this.logger.log(
      `[${params.issueExternalId}] Duration predicted — probable: ${prediction.probable}d, confidence: ${prediction.confidence}, similar issues: ${prediction.similarIssueCount}`,
    );

    return prediction;
  }
}
