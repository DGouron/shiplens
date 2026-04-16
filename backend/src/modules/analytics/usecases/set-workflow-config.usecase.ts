import { Injectable, Logger } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { WorkflowConfigGateway } from '../entities/workflow-config/workflow-config.gateway.js';
import { WorkflowConfig } from '../entities/workflow-config/workflow-config.js';

interface SetWorkflowConfigParams {
  teamId: string;
  startedStatuses: string[];
  completedStatuses: string[];
}

@Injectable()
export class SetWorkflowConfigUsecase
  implements Usecase<SetWorkflowConfigParams, WorkflowConfig>
{
  private readonly logger = new Logger(SetWorkflowConfigUsecase.name);

  constructor(private readonly workflowConfigGateway: WorkflowConfigGateway) {}

  async execute(params: SetWorkflowConfigParams): Promise<WorkflowConfig> {
    const config = WorkflowConfig.create({
      startedStatuses: params.startedStatuses,
      completedStatuses: params.completedStatuses,
      source: 'manual',
    });

    await this.workflowConfigGateway.save(params.teamId, config);

    this.logger.log(
      `[${params.teamId}] Workflow config manually set — started: [${params.startedStatuses.join(', ')}], completed: [${params.completedStatuses.join(', ')}]`,
    );

    return config;
  }
}
