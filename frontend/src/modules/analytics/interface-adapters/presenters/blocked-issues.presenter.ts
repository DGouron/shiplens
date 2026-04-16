import { type Presenter } from '@/shared/foundation/presenter/presenter.ts';
import {
  type BlockedIssueAlertResponse,
  type BlockedIssuesResponse,
} from '../../entities/blocked-issues/blocked-issues.response.ts';
import { memberHealthTrendsHref } from '../url-contracts/member-health-trends.url-contract.ts';
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
    private readonly selectedMemberName: string | null = null,
  ) {}

  present(input: BlockedIssuesResponse): BlockedIssuesViewModel {
    const filtered = input.filter(
      (alert) =>
        alert.teamId === this.selectedTeamId && this.matchesMember(alert),
    );
    if (filtered.length === 0) {
      return {
        items: [],
        emptyMessage: this.translations.emptyMessage,
        showList: false,
        showEmptyMessage: true,
      };
    }
    const items: BlockedIssueItemViewModel[] = filtered.map((alert) =>
      this.toItem(alert),
    );
    return {
      items,
      emptyMessage: null,
      showList: true,
      showEmptyMessage: false,
    };
  }

  private matchesMember(alert: BlockedIssueAlertResponse): boolean {
    if (this.selectedMemberName === null) return true;
    return alert.assigneeName === this.selectedMemberName;
  }

  private toItem(alert: BlockedIssueAlertResponse): BlockedIssueItemViewModel {
    const assigneeName = alert.assigneeName;
    const href =
      assigneeName === null
        ? null
        : memberHealthTrendsHref({
            teamId: alert.teamId,
            memberName: assigneeName,
          });
    return {
      id: alert.id,
      issueTitle: alert.issueTitle,
      statusName: alert.statusName,
      durationLabel: formatDurationHours(alert.durationHours, {
        daysSuffix: this.translations.daysSuffix,
      }),
      severityLabel: this.translateSeverity(alert.severity),
      severityLevel: alert.severity === 'critical' ? 'critical' : 'warning',
      issueUrl: alert.issueUrl,
      assigneeName,
      memberHealthTrendsHref: href,
      showMemberLink: href !== null,
    };
  }

  private translateSeverity(severity: string): string {
    if (severity === 'critical') return this.translations.severityCritical;
    if (severity === 'warning') return this.translations.severityWarning;
    return severity;
  }
}
