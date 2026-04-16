import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { BlockedIssuesGateway } from '../../entities/blocked-issues/blocked-issues.gateway.ts';

export class FailingBlockedIssuesGateway extends BlockedIssuesGateway {
  async fetchBlockedIssues(): Promise<never> {
    throw new GatewayError('Failed to fetch blocked issues');
  }
}
