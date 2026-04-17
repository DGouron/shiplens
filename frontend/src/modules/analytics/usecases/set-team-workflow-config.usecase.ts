import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import { type WorkflowConfigGateway } from '../entities/workflow-config/workflow-config.gateway.ts';
import { type WorkflowConfigResponse } from '../entities/workflow-config/workflow-config.response.ts';

export interface SetTeamWorkflowConfigParams {
  teamId: string;
  startedStatuses: string[];
  completedStatuses: string[];
}

export class SetTeamWorkflowConfigUsecase
  implements Usecase<SetTeamWorkflowConfigParams, WorkflowConfigResponse>
{
  constructor(private readonly gateway: WorkflowConfigGateway) {}

  async execute(
    params: SetTeamWorkflowConfigParams,
  ): Promise<WorkflowConfigResponse> {
    return this.gateway.setWorkflowConfig(params.teamId, {
      startedStatuses: params.startedStatuses,
      completedStatuses: params.completedStatuses,
    });
  }
}
