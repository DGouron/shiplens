import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { BlockedIssueAlertGateway } from '../entities/blocked-issue-alert/blocked-issue-alert.gateway.js';
import { type BlockedIssueAlert } from '../entities/blocked-issue-alert/blocked-issue-alert.js';

@Injectable()
export class GetBlockedIssuesUsecase
  implements Usecase<void, BlockedIssueAlert[]>
{
  constructor(
    private readonly blockedIssueAlertGateway: BlockedIssueAlertGateway,
  ) {}

  async execute(): Promise<BlockedIssueAlert[]> {
    const alerts = await this.blockedIssueAlertGateway.findAllActive();

    return alerts.sort((first, second) => {
      if (first.severity === 'critical' && second.severity !== 'critical')
        return -1;
      if (first.severity !== 'critical' && second.severity === 'critical')
        return 1;
      return second.durationHours - first.durationHours;
    });
  }
}
