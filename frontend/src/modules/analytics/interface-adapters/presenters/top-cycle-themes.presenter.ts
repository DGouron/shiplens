import { type Presenter } from '@/shared/foundation/presenter/presenter.ts';
import {
  type TopCycleThemeRowResponse,
  type TopCycleThemesResponse,
} from '../../entities/top-cycle-themes/top-cycle-themes.response.ts';
import { formatDurationHours } from './format-duration-hours.ts';
import { type TopCycleThemesTranslations } from './top-cycle-themes.translations.ts';
import {
  type TopCycleThemeRankingRowViewModel,
  type TopCycleThemesMetric,
  type TopCycleThemesViewModel,
} from './top-cycle-themes.view-model.schema.ts';

const MAX_THEME_ROWS = 5;

export class TopCycleThemesPresenter
  implements Presenter<TopCycleThemesResponse, TopCycleThemesViewModel>
{
  constructor(
    private readonly translations: TopCycleThemesTranslations,
    private readonly activeMetric: TopCycleThemesMetric,
  ) {}

  present(input: TopCycleThemesResponse): TopCycleThemesViewModel {
    const metricToggle = {
      activeMetric: this.activeMetric,
      countLabel: this.translations.metricCountLabel,
      pointsLabel: this.translations.metricPointsLabel,
      timeLabel: this.translations.metricTimeLabel,
    };
    const baseTitle = this.translations.cardTitle;
    const refreshLabel = this.translations.refreshLabel;

    if (input.status === 'no_active_cycle') {
      return {
        title: baseTitle,
        refreshLabel,
        metricToggle,
        rankingRows: [],
        emptyMessage: this.translations.emptyNoActiveCycle,
        emptyTone: 'neutral',
        showMetricToggle: false,
        showRows: false,
        showEmptyMessage: true,
        showRefreshButton: false,
      };
    }

    if (input.status === 'below_threshold') {
      return {
        title: baseTitle,
        refreshLabel,
        metricToggle,
        rankingRows: [],
        emptyMessage: this.translations.emptyBelowThreshold,
        emptyTone: 'neutral',
        showMetricToggle: false,
        showRows: false,
        showEmptyMessage: true,
        showRefreshButton: false,
      };
    }

    if (input.status === 'ai_unavailable') {
      return {
        title: baseTitle,
        refreshLabel,
        metricToggle,
        rankingRows: [],
        emptyMessage: this.translations.emptyAiUnavailable,
        emptyTone: 'warning',
        showMetricToggle: false,
        showRows: false,
        showEmptyMessage: true,
        showRefreshButton: true,
      };
    }

    const sorted = this.sortByActiveMetric(input.themes);
    const rankingRows = sorted
      .slice(0, MAX_THEME_ROWS)
      .map((theme) => this.toRankingRow(theme));

    return {
      title: baseTitle,
      refreshLabel,
      metricToggle,
      rankingRows,
      emptyMessage: null,
      emptyTone: 'neutral',
      showMetricToggle: true,
      showRows: true,
      showEmptyMessage: false,
      showRefreshButton: true,
    };
  }

  private sortByActiveMetric(
    themes: TopCycleThemeRowResponse[],
  ): TopCycleThemeRowResponse[] {
    const copy = [...themes];
    copy.sort((left, right) => {
      const leftValue = this.metricValue(left);
      const rightValue = this.metricValue(right);
      if (leftValue !== rightValue) {
        return rightValue - leftValue;
      }
      return left.name.localeCompare(right.name);
    });
    return copy;
  }

  private metricValue(theme: TopCycleThemeRowResponse): number {
    if (this.activeMetric === 'count') return theme.issueCount;
    if (this.activeMetric === 'points') return theme.totalPoints;
    return theme.totalCycleTimeInHours ?? 0;
  }

  private toRankingRow(
    theme: TopCycleThemeRowResponse,
  ): TopCycleThemeRankingRowViewModel {
    return {
      themeName: theme.name,
      metricValueLabel: this.metricValueLabel(theme),
    };
  }

  private metricValueLabel(theme: TopCycleThemeRowResponse): string {
    if (this.activeMetric === 'count') return `${theme.issueCount}`;
    if (this.activeMetric === 'points') return `${theme.totalPoints}`;
    return formatDurationHours(theme.totalCycleTimeInHours ?? 0, {
      daysSuffix: this.translations.daysSuffix,
    });
  }
}
