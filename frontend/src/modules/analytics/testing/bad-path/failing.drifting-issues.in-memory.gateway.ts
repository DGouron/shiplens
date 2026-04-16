import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { DriftingIssuesGateway } from '../../entities/drifting-issues/drifting-issues.gateway.ts';

export class FailingDriftingIssuesGateway extends DriftingIssuesGateway {
  async fetchDriftingIssues(): Promise<never> {
    throw new GatewayError('Failed to fetch drifting issues');
  }
}
