import { type Presenter } from '@/shared/foundation/presenter/presenter.ts';
import {
  type TopCycleAssigneeRowResponse,
  type TopCycleAssigneesResponse,
} from '../../entities/top-cycle-assignees/top-cycle-assignees.response.ts';
import { formatDurationHours } from './format-duration-hours.ts';
import { type TopCycleAssigneesTranslations } from './top-cycle-assignees.translations.ts';
import {
  type TopCycleAssigneeRankingRowViewModel,
  type TopCycleAssigneesMetric,
  type TopCycleAssigneesViewModel,
} from './top-cycle-assignees.view-model.schema.ts';

const MAX_ASSIGNEE_ROWS = 5;

export class TopCycleAssigneesPresenter
  implements Presenter<TopCycleAssigneesResponse, TopCycleAssigneesViewModel>
{
  constructor(
    private readonly translations: TopCycleAssigneesTranslations,
    private readonly activeMetric: TopCycleAssigneesMetric,
  ) {}

  present(input: TopCycleAssigneesResponse): TopCycleAssigneesViewModel {
    const metricToggle = {
      activeMetric: this.activeMetric,
      countLabel: this.translations.metricCountLabel,
      pointsLabel: this.translations.metricPointsLabel,
      timeLabel: this.translations.metricTimeLabel,
    };

    if (input.status === 'no_active_cycle') {
      return {
        title: this.translations.cardTitle,
        metricToggle,
        rankingRows: [],
        emptyMessage: this.translations.emptyNoActiveCycle,
        showRows: false,
        showEmptyMessage: true,
      };
    }

    if (input.assignees.length === 0) {
      return {
        title: this.translations.cardTitle,
        metricToggle,
        rankingRows: [],
        emptyMessage: this.translations.emptyNoCompletedWork,
        showRows: false,
        showEmptyMessage: true,
      };
    }

    const sorted = this.sortByActiveMetric(input.assignees);
    const rankingRows = sorted
      .slice(0, MAX_ASSIGNEE_ROWS)
      .map((assignee) => this.toRankingRow(assignee));

    return {
      title: this.translations.cardTitle,
      metricToggle,
      rankingRows,
      emptyMessage: null,
      showRows: true,
      showEmptyMessage: false,
    };
  }

  private sortByActiveMetric(
    assignees: TopCycleAssigneeRowResponse[],
  ): TopCycleAssigneeRowResponse[] {
    const copy = [...assignees];
    copy.sort((left, right) => {
      const leftValue = this.metricValue(left);
      const rightValue = this.metricValue(right);
      if (leftValue !== rightValue) {
        return rightValue - leftValue;
      }
      return left.assigneeName.localeCompare(right.assigneeName);
    });
    return copy;
  }

  private metricValue(assignee: TopCycleAssigneeRowResponse): number {
    if (this.activeMetric === 'count') return assignee.issueCount;
    if (this.activeMetric === 'points') return assignee.totalPoints;
    return assignee.totalCycleTimeInHours ?? 0;
  }

  private toRankingRow(
    assignee: TopCycleAssigneeRowResponse,
  ): TopCycleAssigneeRankingRowViewModel {
    return {
      assigneeName: assignee.assigneeName,
      metricValueLabel: this.metricValueLabel(assignee),
    };
  }

  private metricValueLabel(assignee: TopCycleAssigneeRowResponse): string {
    if (this.activeMetric === 'count') return `${assignee.issueCount}`;
    if (this.activeMetric === 'points') return `${assignee.totalPoints}`;
    return formatDurationHours(assignee.totalCycleTimeInHours ?? 0, {
      daysSuffix: this.translations.daysSuffix,
    });
  }
}
