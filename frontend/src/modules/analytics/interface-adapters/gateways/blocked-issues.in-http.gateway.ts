import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { BlockedIssuesGateway } from '../../entities/blocked-issues/blocked-issues.gateway.ts';
import { type BlockedIssuesResponse } from '../../entities/blocked-issues/blocked-issues.response.ts';
import { blockedIssueAlertResponseGuard } from './blocked-issues.response.guard.ts';

export class BlockedIssuesInHttpGateway extends BlockedIssuesGateway {
  async fetchBlockedIssues(): Promise<BlockedIssuesResponse> {
    const response = await fetch('/analytics/blocked-issues');
    if (!response.ok) {
      throw new GatewayError(
        `Failed to fetch blocked issues: HTTP ${response.status}`,
      );
    }
    const payload: unknown = await response.json();
    const parsed = blockedIssueAlertResponseGuard.safeParseCollection(payload);
    if (!parsed.success) {
      throw new GatewayError(
        `Invalid blocked issues response payload: ${parsed.error.message}`,
      );
    }
    return parsed.data;
  }
}
