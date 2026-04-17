import { type WorkflowConfigResponse } from './workflow-config.response.ts';

export interface SetWorkflowConfigInput {
  startedStatuses: string[];
  completedStatuses: string[];
}

export abstract class WorkflowConfigGateway {
  abstract getWorkflowConfig(teamId: string): Promise<WorkflowConfigResponse>;
  abstract setWorkflowConfig(
    teamId: string,
    input: SetWorkflowConfigInput,
  ): Promise<WorkflowConfigResponse>;
}
