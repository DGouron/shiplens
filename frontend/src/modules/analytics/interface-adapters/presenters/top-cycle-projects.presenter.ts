import { type Presenter } from '@/shared/foundation/presenter/presenter.ts';
import { NO_PROJECT_BUCKET_ID } from '../../entities/top-cycle-projects/top-cycle-projects.response.schema.ts';
import {
  type TopCycleProjectRowResponse,
  type TopCycleProjectsResponse,
} from '../../entities/top-cycle-projects/top-cycle-projects.response.ts';
import { formatDurationHours } from './format-duration-hours.ts';
import { type TopCycleProjectsTranslations } from './top-cycle-projects.translations.ts';
import {
  type TopCycleProjectRankingRowViewModel,
  type TopCycleProjectsMetric,
  type TopCycleProjectsViewModel,
} from './top-cycle-projects.view-model.schema.ts';

const COLLAPSED_ROW_COUNT = 5;

export class TopCycleProjectsPresenter
  implements Presenter<TopCycleProjectsResponse, TopCycleProjectsViewModel>
{
  constructor(
    private readonly translations: TopCycleProjectsTranslations,
    private readonly activeMetric: TopCycleProjectsMetric,
    private readonly isExpanded: boolean,
  ) {}

  present(input: TopCycleProjectsResponse): TopCycleProjectsViewModel {
    const metricToggle = {
      activeMetric: this.activeMetric,
      countLabel: this.translations.metricCountLabel,
      pointsLabel: this.translations.metricPointsLabel,
      timeLabel: this.translations.metricTimeLabel,
    };
    const expandLabel = this.isExpanded
      ? this.translations.showLessLabel
      : this.translations.showMoreLabel;

    if (input.status === 'no_active_cycle') {
      return {
        title: this.translations.cardTitle,
        metricToggle,
        rankingRows: [],
        emptyMessage: this.translations.emptyNoActiveCycle,
        showRows: false,
        showEmptyMessage: true,
        showExpandButton: false,
        expandLabel,
      };
    }

    if (input.projects.length === 0) {
      return {
        title: this.translations.cardTitle,
        metricToggle,
        rankingRows: [],
        emptyMessage: this.translations.emptyNoActivity,
        showRows: false,
        showEmptyMessage: true,
        showExpandButton: false,
        expandLabel,
      };
    }

    const sorted = this.sortByActiveMetric(input.projects);
    const visibleCount = this.isExpanded ? sorted.length : COLLAPSED_ROW_COUNT;
    const rankingRows = sorted
      .slice(0, visibleCount)
      .map((project) => this.toRankingRow(project));

    return {
      title: this.translations.cardTitle,
      metricToggle,
      rankingRows,
      emptyMessage: null,
      showRows: true,
      showEmptyMessage: false,
      showExpandButton: sorted.length > COLLAPSED_ROW_COUNT,
      expandLabel,
    };
  }

  private sortByActiveMetric(
    projects: TopCycleProjectRowResponse[],
  ): TopCycleProjectRowResponse[] {
    const copy = [...projects];
    copy.sort((left, right) => {
      const leftValue = this.metricValue(left);
      const rightValue = this.metricValue(right);
      if (leftValue !== rightValue) {
        return rightValue - leftValue;
      }
      return left.projectId.localeCompare(right.projectId);
    });
    return copy;
  }

  private metricValue(project: TopCycleProjectRowResponse): number {
    if (this.activeMetric === 'count') return project.issueCount;
    if (this.activeMetric === 'points') return project.totalPoints;
    return project.totalCycleTimeInHours ?? 0;
  }

  private toRankingRow(
    project: TopCycleProjectRowResponse,
  ): TopCycleProjectRankingRowViewModel {
    return {
      projectId: project.projectId,
      projectName: project.isNoProjectBucket
        ? this.translations.noProjectBucketLabel
        : project.projectName,
      metricValueLabel: this.metricValueLabel(project),
      isNoProjectBucket:
        project.isNoProjectBucket || project.projectId === NO_PROJECT_BUCKET_ID,
    };
  }

  private metricValueLabel(project: TopCycleProjectRowResponse): string {
    if (this.activeMetric === 'count') return `${project.issueCount}`;
    if (this.activeMetric === 'points') return `${project.totalPoints}`;
    return formatDurationHours(project.totalCycleTimeInHours ?? 0, {
      daysSuffix: this.translations.daysSuffix,
    });
  }
}
