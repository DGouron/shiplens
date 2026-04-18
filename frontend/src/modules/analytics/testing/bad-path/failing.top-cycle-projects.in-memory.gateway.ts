import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { TopCycleProjectsGateway } from '../../entities/top-cycle-projects/top-cycle-projects.gateway.ts';

export class FailingTopCycleProjectsGateway extends TopCycleProjectsGateway {
  async fetchTopCycleProjects(): Promise<never> {
    throw new GatewayError('Failed to fetch top cycle projects');
  }

  async fetchCycleProjectIssues(): Promise<never> {
    throw new GatewayError('Failed to fetch cycle project issues');
  }
}
