import { type Presenter } from '@/shared/foundation/presenter/presenter.ts';
import {
  type DriftingIssueResponse,
  type DriftingIssuesResponse,
} from '../../entities/drifting-issues/drifting-issues.response.ts';
import { type DriftingIssuesTranslations } from './drifting-issues.translations.ts';
import {
  type DriftingIssueRowViewModel,
  type DriftingIssuesViewModel,
} from './drifting-issues.view-model.schema.ts';
import { formatDurationHours } from './format-duration-hours.ts';

export class DriftingIssuesPresenter
  implements Presenter<DriftingIssuesResponse, DriftingIssuesViewModel>
{
  constructor(private readonly translations: DriftingIssuesTranslations) {}

  present(input: DriftingIssuesResponse): DriftingIssuesViewModel {
    if (input.length === 0) {
      return {
        rows: [],
        emptyMessage: this.translations.emptyMessage,
        showList: false,
        showEmptyMessage: true,
      };
    }
    return {
      rows: input.map((issue) => this.toRow(issue)),
      emptyMessage: null,
      showList: true,
      showEmptyMessage: false,
    };
  }

  private toRow(issue: DriftingIssueResponse): DriftingIssueRowViewModel {
    return {
      id: issue.issueExternalId,
      title: issue.issueTitle,
      statusName: issue.statusName,
      driftLabel: this.translateDriftStatus(issue.driftStatus),
      elapsedLabel: `${this.translations.elapsedPrefix}: ${this.formatHours(issue.elapsedBusinessHours)}`,
      expectedLabel: `${this.translations.expectedPrefix}: ${this.formatExpected(issue.expectedMaxHours)}`,
      pointsLabel: this.formatPoints(issue.points),
      issueUrl: issue.issueUrl,
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
