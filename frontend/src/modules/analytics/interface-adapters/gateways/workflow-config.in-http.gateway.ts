import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import {
  type SetWorkflowConfigInput,
  WorkflowConfigGateway,
} from '../../entities/workflow-config/workflow-config.gateway.ts';
import { type WorkflowConfigResponse } from '../../entities/workflow-config/workflow-config.response.ts';
import { workflowConfigResponseGuard } from './workflow-config.response.guard.ts';

export class WorkflowConfigInHttpGateway extends WorkflowConfigGateway {
  async getWorkflowConfig(teamId: string): Promise<WorkflowConfigResponse> {
    const response = await fetch(
      `/analytics/teams/${encodeURIComponent(teamId)}/workflow-config`,
    );
    if (!response.ok) {
      throw new GatewayError(
        `Failed to fetch workflow config: HTTP ${response.status}`,
      );
    }
    const payload: unknown = await response.json();
    const parsed = workflowConfigResponseGuard.safeParse(payload);
    if (!parsed.success) {
      throw new GatewayError(
        `Invalid workflow config response: ${parsed.error.message}`,
      );
    }
    return parsed.data;
  }

  async setWorkflowConfig(
    teamId: string,
    input: SetWorkflowConfigInput,
  ): Promise<WorkflowConfigResponse> {
    const response = await fetch(
      `/analytics/teams/${encodeURIComponent(teamId)}/workflow-config`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startedStatuses: input.startedStatuses,
          completedStatuses: input.completedStatuses,
        }),
      },
    );
    if (!response.ok) {
      throw new GatewayError(
        `Failed to set workflow config: HTTP ${response.status}`,
      );
    }
    const payload: unknown = await response.json();
    const parsed = workflowConfigResponseGuard.safeParse(payload);
    if (!parsed.success) {
      throw new GatewayError(
        `Invalid workflow config response: ${parsed.error.message}`,
      );
    }
    return parsed.data;
  }
}
