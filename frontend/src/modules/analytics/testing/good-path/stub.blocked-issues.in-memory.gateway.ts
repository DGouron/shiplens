import { BlockedIssuesGateway } from '../../entities/blocked-issues/blocked-issues.gateway.ts';
import { type BlockedIssuesResponse } from '../../entities/blocked-issues/blocked-issues.response.ts';

interface StubBlockedIssuesGatewayOptions {
  response?: BlockedIssuesResponse;
}

export class StubBlockedIssuesGateway extends BlockedIssuesGateway {
  private readonly response: BlockedIssuesResponse;
  callCount = 0;

  constructor(options: StubBlockedIssuesGatewayOptions = {}) {
    super();
    this.response = options.response ?? [];
  }

  async fetchBlockedIssues(): Promise<BlockedIssuesResponse> {
    this.callCount += 1;
    return this.response.map((alert) => ({ ...alert }));
  }
}
