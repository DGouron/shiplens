import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { WorkflowConfigGateway } from '../../entities/workflow-config/workflow-config.gateway.ts';

export class FailingWorkflowConfigGateway extends WorkflowConfigGateway {
  async getWorkflowConfig(): Promise<never> {
    throw new GatewayError('Failed to fetch workflow config');
  }

  async setWorkflowConfig(): Promise<never> {
    throw new GatewayError('Failed to set workflow config');
  }
}
