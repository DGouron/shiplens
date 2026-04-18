import { GatewayError } from '@shared/foundation/gateway-error.js';
import {
  type ActiveCycleLocator,
  type CycleAssigneeAggregate,
  type CycleAssigneeIssuesResult,
} from '../../entities/top-cycle-assignees/top-cycle-assignees.schema.js';
import { TopCycleAssigneesDataGateway } from '../../entities/top-cycle-assignees/top-cycle-assignees-data.gateway.js';

export class FailingTopCycleAssigneesDataGateway extends TopCycleAssigneesDataGateway {
  async getActiveCycleLocator(): Promise<ActiveCycleLocator | null> {
    throw new GatewayError(
      'Gateway error: unable to fetch active cycle locator',
    );
  }

  async getCycleAssigneeAggregates(): Promise<CycleAssigneeAggregate[]> {
    throw new GatewayError(
      'Gateway error: unable to fetch cycle assignee aggregates',
    );
  }

  async getCycleIssuesForAssignee(): Promise<CycleAssigneeIssuesResult> {
    throw new GatewayError(
      'Gateway error: unable to fetch cycle issues for assignee',
    );
  }
}
