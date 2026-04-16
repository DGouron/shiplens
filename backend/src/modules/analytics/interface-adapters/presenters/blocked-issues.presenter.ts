import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';
import { type BlockedIssueAlert } from '../../entities/blocked-issue-alert/blocked-issue-alert.js';

export interface BlockedIssueAlertDto {
  id: string;
  issueExternalId: string;
  issueTitle: string;
  teamId: string;
  statusName: string;
  severity: string;
  durationHours: number;
  issueUrl: string;
  detectedAt: string;
  assigneeName: string | null;
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
      teamId: alert.teamId,
      statusName: alert.statusName,
      severity: alert.severity,
      durationHours: alert.durationHours,
      issueUrl: alert.issueUrl,
      detectedAt: alert.detectedAt,
      assigneeName: alert.assigneeName,
    }));
  }
}
