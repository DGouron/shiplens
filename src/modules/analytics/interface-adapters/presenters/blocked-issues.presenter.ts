import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';
import { type BlockedIssueAlert } from '../../entities/blocked-issue-alert/blocked-issue-alert.js';

export interface BlockedIssueAlertDto {
  id: string;
  issueExternalId: string;
  issueTitle: string;
  statusName: string;
  severity: string;
  durationHours: string;
  issueUrl: string;
  detectedAt: string;
}

@Injectable()
export class BlockedIssuesPresenter
  implements Presenter<BlockedIssueAlert[], BlockedIssueAlertDto[]>
{
  present(alerts: BlockedIssueAlert[]): BlockedIssueAlertDto[] {
    return alerts.map((alert) => ({
      id: alert.id,
      issueExternalId: alert.issueExternalId,
      issueTitle: alert.issueTitle,
      statusName: alert.statusName,
      severity: alert.severity,
      durationHours: `${alert.durationHours}h`,
      issueUrl: alert.issueUrl,
      detectedAt: alert.detectedAt,
    }));
  }
}
