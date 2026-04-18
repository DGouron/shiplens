import { GatewayError } from '@shared/foundation/gateway-error.js';
import {
  type ActiveCycleLocator,
  type CycleProjectAggregate,
  type CycleProjectIssuesResult,
} from '../../entities/top-cycle-projects/top-cycle-projects.schema.js';
import { TopCycleProjectsDataGateway } from '../../entities/top-cycle-projects/top-cycle-projects-data.gateway.js';

export class FailingTopCycleProjectsDataGateway extends TopCycleProjectsDataGateway {
  async getActiveCycleLocator(): Promise<ActiveCycleLocator | null> {
    throw new GatewayError(
      'Gateway error: unable to fetch active cycle locator',
    );
  }

  async getCycleProjectAggregates(): Promise<CycleProjectAggregate[]> {
    throw new GatewayError(
      'Gateway error: unable to fetch cycle project aggregates',
    );
  }

  async getCycleIssuesForProject(): Promise<CycleProjectIssuesResult> {
    throw new GatewayError(
      'Gateway error: unable to fetch cycle issues for project',
    );
  }
}
