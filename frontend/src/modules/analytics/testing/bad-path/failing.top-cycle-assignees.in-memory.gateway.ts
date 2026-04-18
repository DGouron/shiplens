import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { TopCycleAssigneesGateway } from '../../entities/top-cycle-assignees/top-cycle-assignees.gateway.ts';

export class FailingTopCycleAssigneesGateway extends TopCycleAssigneesGateway {
  async fetchTopCycleAssignees(): Promise<never> {
    throw new GatewayError('Failed to fetch top cycle assignees');
  }

  async fetchCycleAssigneeIssues(): Promise<never> {
    throw new GatewayError('Failed to fetch cycle assignee issues');
  }
}
