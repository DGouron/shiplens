import { GatewayError } from '@shared/foundation/gateway-error.js';
import { WorkflowConfigGateway } from '../../entities/workflow-config/workflow-config.gateway.js';
import { type WorkflowConfig } from '../../entities/workflow-config/workflow-config.js';

export class FailingWorkflowConfigGateway extends WorkflowConfigGateway {
  async findByTeamId(_teamId: string): Promise<WorkflowConfig | null> {
    throw new GatewayError('Failed to find workflow config');
  }

  async save(_teamId: string, _config: WorkflowConfig): Promise<void> {
    throw new GatewayError('Failed to save workflow config');
  }
}
