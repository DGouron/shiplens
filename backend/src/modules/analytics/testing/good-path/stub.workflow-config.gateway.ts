import { WorkflowConfigGateway } from '../../entities/workflow-config/workflow-config.gateway.js';
import { type WorkflowConfig } from '../../entities/workflow-config/workflow-config.js';

export class StubWorkflowConfigGateway extends WorkflowConfigGateway {
  private configs: Map<string, WorkflowConfig> = new Map();

  async findByTeamId(teamId: string): Promise<WorkflowConfig | null> {
    return this.configs.get(teamId) ?? null;
  }

  async save(teamId: string, config: WorkflowConfig): Promise<void> {
    this.configs.set(teamId, config);
  }
}
