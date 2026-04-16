import { type WorkflowConfig } from './workflow-config.js';

export abstract class WorkflowConfigGateway {
  abstract findByTeamId(teamId: string): Promise<WorkflowConfig | null>;
  abstract save(teamId: string, config: WorkflowConfig): Promise<void>;
}
