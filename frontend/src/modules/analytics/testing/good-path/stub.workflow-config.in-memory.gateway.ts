import {
  type SetWorkflowConfigInput,
  WorkflowConfigGateway,
} from '../../entities/workflow-config/workflow-config.gateway.ts';
import { type WorkflowConfigResponse } from '../../entities/workflow-config/workflow-config.response.ts';

export class StubWorkflowConfigGateway extends WorkflowConfigGateway {
  configs: Map<string, WorkflowConfigResponse> = new Map();

  async getWorkflowConfig(teamId: string): Promise<WorkflowConfigResponse> {
    return (
      this.configs.get(teamId) ?? {
        startedStatuses: [],
        completedStatuses: [],
        source: 'auto-detected',
        knownStatuses: [],
      }
    );
  }

  async setWorkflowConfig(
    teamId: string,
    input: SetWorkflowConfigInput,
  ): Promise<WorkflowConfigResponse> {
    const previous = this.configs.get(teamId);
    const next: WorkflowConfigResponse = {
      startedStatuses: input.startedStatuses,
      completedStatuses: input.completedStatuses,
      source: 'manual',
      knownStatuses: previous?.knownStatuses ?? [],
    };
    this.configs.set(teamId, next);
    return next;
  }
}
