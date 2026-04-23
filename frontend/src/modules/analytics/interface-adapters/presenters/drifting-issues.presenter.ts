import { type Presenter } from '@/shared/foundation/presenter/presenter.ts';
import {
  type DriftingIssueResponse,
  type DriftingIssuesResponse,
} from '../../entities/drifting-issues/drifting-issues.response.ts';
import { memberHealthTrendsHref } from '../url-contracts/member-health-trends.url-contract.ts';
import { type DriftingIssuesTranslations } from './drifting-issues.translations.ts';
import {
  type DriftingIssueRowViewModel,
  type DriftingIssuesViewModel,
} from './drifting-issues.view-model.schema.ts';
import { formatDurationHours } from './format-duration-hours.ts';
import { formatMemberDisplayName } from './format-member-display-name.ts';
import { isProbableEpic } from './is-probable-epic.ts';

export class DriftingIssuesPresenter
  implements Presenter<DriftingIssuesResponse, DriftingIssuesViewModel>
{
  constructor(
    private readonly translations: DriftingIssuesTranslations,
    private readonly selectedMemberName: string | null = null,
  ) {}

  present(input: DriftingIssuesResponse): DriftingIssuesViewModel {
    const filtered = input.filter(
      (issue) => !isProbableEpic(issue.points) && this.matchesMember(issue),
    );
    if (filtered.length === 0) {
      return {
        rows: [],
        emptyMessage: this.translations.emptyMessage,
        showList: false,
        showEmptyMessage: true,
      };
    }
    return {
      rows: filtered.map((issue) => this.toRow(issue)),
      emptyMessage: null,
      showList: true,
      showEmptyMessage: false,
    };
  }

  private matchesMember(issue: DriftingIssueResponse): boolean {
    if (this.selectedMemberName === null) return true;
    return issue.assigneeName === this.selectedMemberName;
  }

  private toRow(issue: DriftingIssueResponse): DriftingIssueRowViewModel {
    const assigneeName = issue.assigneeName;
    const href =
      assigneeName === null
        ? null
        : memberHealthTrendsHref({
            teamId: issue.teamId,
            memberName: assigneeName,
          });
    return {
      id: issue.issueExternalId,
      title: issue.issueTitle,
      statusName: issue.statusName,
      driftLabel: this.translateDriftStatus(issue.driftStatus),
      elapsedLabel: `${this.translations.elapsedPrefix}: ${this.formatHours(issue.elapsedBusinessHours)}`,
      expectedLabel: `${this.translations.expectedPrefix}: ${this.formatExpected(issue.expectedMaxHours)}`,
      pointsLabel: this.formatPoints(issue.points),
      issueUrl: issue.issueUrl,
      assigneeName,
      assigneeLabel:
        assigneeName === null ? null : formatMemberDisplayName(assigneeName),
      memberHealthTrendsHref: href,
      showMemberLink: href !== null,
    };
  }

  private formatHours(hours: number): string {
    return formatDurationHours(hours, {
      daysSuffix: this.translations.daysSuffix,
    });
  }

  private formatExpected(expectedMaxHours: number | null): string {
    if (expectedMaxHours === null) {
      return this.translations.expectedUnavailable;
    }
    return this.formatHours(expectedMaxHours);
  }

  private formatPoints(points: number | null): string {
    if (points === null) {
      return this.translations.pointsUnavailable;
    }
    return this.translations.pointsLabel(points);
  }

  private translateDriftStatus(driftStatus: string): string {
    if (driftStatus === 'drifting')
      return this.translations.driftStatusDrifting;
    if (driftStatus === 'needs-splitting')
      return this.translations.driftStatusNeedsSplitting;
    return driftStatus;
  }
}
