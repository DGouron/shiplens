import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { type WorkflowConfig } from '../entities/workflow-config/workflow-config.js';
import { ResolveWorkflowConfigUsecase } from './resolve-workflow-config.usecase.js';

interface GetWorkflowConfigParams {
  teamId: string;
}

@Injectable()
export class GetWorkflowConfigUsecase
  implements Usecase<GetWorkflowConfigParams, WorkflowConfig>
{
  constructor(
    private readonly resolveWorkflowConfig: ResolveWorkflowConfigUsecase,
  ) {}

  async execute(params: GetWorkflowConfigParams): Promise<WorkflowConfig> {
    return this.resolveWorkflowConfig.execute(params);
  }
}
