import { type Presenter } from '@/shared/foundation/presenter/presenter.ts';
import {
  type BlockedIssueAlertResponse,
  type BlockedIssuesResponse,
} from '../../entities/blocked-issues/blocked-issues.response.ts';
import { type BlockedIssuesTranslations } from './blocked-issues.translations.ts';
import {
  type BlockedIssueItemViewModel,
  type BlockedIssuesViewModel,
} from './blocked-issues.view-model.schema.ts';
import { formatDurationHours } from './format-duration-hours.ts';

export class BlockedIssuesPresenter
  implements Presenter<BlockedIssuesResponse, BlockedIssuesViewModel>
{
  constructor(
    private readonly translations: BlockedIssuesTranslations,
    private readonly selectedTeamId: string,
  ) {}

  present(input: BlockedIssuesResponse): BlockedIssuesViewModel {
    const filtered = input.filter(
      (alert) => alert.teamId === this.selectedTeamId,
    );
    if (filtered.length === 0) {
      return { items: [], emptyMessage: this.translations.emptyMessage };
    }
    const items: BlockedIssueItemViewModel[] = filtered.map((alert) =>
      this.toItem(alert),
    );
    return { items, emptyMessage: null };
  }

  private toItem(alert: BlockedIssueAlertResponse): BlockedIssueItemViewModel {
    return {
      id: alert.id,
      issueTitle: alert.issueTitle,
      statusName: alert.statusName,
      durationLabel: formatDurationHours(alert.durationHours, {
        daysSuffix: this.translations.daysSuffix,
      }),
      severityLabel: this.translateSeverity(alert.severity),
      issueUrl: alert.issueUrl,
    };
  }

  private translateSeverity(severity: string): string {
    if (severity === 'critical') return this.translations.severityCritical;
    if (severity === 'warning') return this.translations.severityWarning;
    return severity;
  }
}
