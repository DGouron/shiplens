import { type BlockedIssuesResponse } from './blocked-issues.response.ts';

export abstract class BlockedIssuesGateway {
  abstract fetchBlockedIssues(): Promise<BlockedIssuesResponse>;
}
