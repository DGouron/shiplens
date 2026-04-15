import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import { type BlockedIssuesGateway } from '../entities/blocked-issues/blocked-issues.gateway.ts';
import { type BlockedIssuesResponse } from '../entities/blocked-issues/blocked-issues.response.ts';

export class ListBlockedIssuesUsecase
  implements Usecase<void, BlockedIssuesResponse>
{
  constructor(private readonly gateway: BlockedIssuesGateway) {}

  async execute(): Promise<BlockedIssuesResponse> {
    return this.gateway.fetchBlockedIssues();
  }
}
