import { Injectable, Logger } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { EstimationAccuracy } from '../entities/estimation-accuracy/estimation-accuracy.js';
import { EstimationAccuracyDataGateway } from '../entities/estimation-accuracy/estimation-accuracy-data.gateway.js';
import { ResolveWorkflowConfigUsecase } from './resolve-workflow-config.usecase.js';

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
    private readonly resolveWorkflowConfig: ResolveWorkflowConfigUsecase,
  ) {}

  async execute(
    params: CalculateEstimationAccuracyParams,
  ): Promise<EstimationAccuracy> {
    this.logger.log(
      `[${params.cycleId}] Estimation accuracy calculation started`,
    );

    const workflowConfig = await this.resolveWorkflowConfig.execute({
      teamId: params.teamId,
    });

    const data = await this.estimationAccuracyDataGateway.getEstimationData(
      params.cycleId,
      params.teamId,
      workflowConfig.startedStatuses,
      workflowConfig.completedStatuses,
    );

    const result = EstimationAccuracy.create(data);
    const teamScore = result.teamScore();

    this.logger.log(
      `[${params.cycleId}] Estimation accuracy calculated — issues: ${teamScore.issueCount}, team score: ${teamScore.classification}`,
    );

    return result;
  }
}
