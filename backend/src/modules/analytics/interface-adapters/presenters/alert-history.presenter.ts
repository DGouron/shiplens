import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';
import { type BlockedIssueAlert } from '../../entities/blocked-issue-alert/blocked-issue-alert.js';

export interface AlertHistoryDto {
  id: string;
  issueExternalId: string;
  issueTitle: string;
  statusName: string;
  severity: string;
  durationHours: string;
  issueUrl: string;
  detectedAt: string;
  active: boolean;
  resolvedAt: string | null;
}

@Injectable()
export class AlertHistoryPresenter
  implements Presenter<BlockedIssueAlert[], AlertHistoryDto[]>
{
  present(alerts: BlockedIssueAlert[]): AlertHistoryDto[] {
    return alerts.map((alert) => ({
      id: alert.id,
      issueExternalId: alert.issueExternalId,
      issueTitle: alert.issueTitle,
      statusName: alert.statusName,
      severity: alert.severity,
      durationHours: `${alert.durationHours}h`,
      issueUrl: alert.issueUrl,
      detectedAt: alert.detectedAt,
      active: alert.active,
      resolvedAt: alert.resolvedAt,
    }));
  }
}
