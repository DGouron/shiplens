import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { BlockedIssueAlertGateway } from '../entities/blocked-issue-alert/blocked-issue-alert.gateway.js';
import { type BlockedIssueAlert } from '../entities/blocked-issue-alert/blocked-issue-alert.js';

@Injectable()
export class GetAlertHistoryUsecase
  implements Usecase<void, BlockedIssueAlert[]>
{
  constructor(
    private readonly blockedIssueAlertGateway: BlockedIssueAlertGateway,
  ) {}

  async execute(): Promise<BlockedIssueAlert[]> {
    return this.blockedIssueAlertGateway.findAll();
  }
}
