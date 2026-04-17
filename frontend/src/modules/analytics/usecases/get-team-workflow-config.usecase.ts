import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import { type WorkflowConfigGateway } from '../entities/workflow-config/workflow-config.gateway.ts';
import { type WorkflowConfigResponse } from '../entities/workflow-config/workflow-config.response.ts';

export class GetTeamWorkflowConfigUsecase
  implements Usecase<string, WorkflowConfigResponse>
{
  constructor(private readonly gateway: WorkflowConfigGateway) {}

  async execute(teamId: string): Promise<WorkflowConfigResponse> {
    return this.gateway.getWorkflowConfig(teamId);
  }
}
