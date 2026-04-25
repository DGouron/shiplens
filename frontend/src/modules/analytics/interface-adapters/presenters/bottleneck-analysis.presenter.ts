import { type Presenter } from '@/shared/foundation/presenter/presenter.ts';
import {
  type BottleneckAnalysisResponse,
  type StatusDistributionResponse,
} from '../../entities/bottleneck-analysis/bottleneck-analysis.response.ts';
import { type BottleneckAnalysisTranslations } from './bottleneck-analysis.translations.ts';
import {
  type BottleneckAnalysisViewModel,
  type BottleneckRowViewModel,
} from './bottleneck-analysis.view-model.schema.ts';
import { formatDurationHours } from './format-duration-hours.ts';

export class BottleneckAnalysisPresenter
  implements Presenter<BottleneckAnalysisResponse, BottleneckAnalysisViewModel>
{
  constructor(
    private readonly translations: BottleneckAnalysisTranslations,
    private readonly selectedMemberName: string | null = null,
  ) {}

  present(input: BottleneckAnalysisResponse): BottleneckAnalysisViewModel {
    const distribution = this.selectDistribution(input);
    if (distribution.entries.length === 0) {
      return {
        rows: [],
        bottleneckHeadline: this.translations.noBottleneckHeadline,
        emptyMessage: this.translations.emptyMessage,
        showTable: false,
        showEmptyMessage: true,
      };
    }
    const sorted = [...distribution.entries].sort(
      (left, right) => right.medianHours - left.medianHours,
    );
    const maxMedianHours = sorted[0]?.medianHours ?? 1;
    const rows: BottleneckRowViewModel[] = sorted.map((entry) => ({
      statusName: entry.statusName,
      medianHoursLabel: formatDurationHours(entry.medianHours, {
        daysSuffix: this.translations.daysSuffix,
      }),
      isBottleneck: entry.statusName === distribution.bottleneckStatus,
      barWidthPercent: Math.round((entry.medianHours / maxMedianHours) * 100),
    }));
    return {
      rows,
      bottleneckHeadline: this.translations.bottleneckHeadline(
        distribution.bottleneckStatus,
      ),
      emptyMessage: null,
      showTable: true,
      showEmptyMessage: false,
    };
  }

  private selectDistribution(input: BottleneckAnalysisResponse): {
    entries: StatusDistributionResponse[];
    bottleneckStatus: string;
  } {
    if (this.selectedMemberName === null) {
      return {
        entries: input.statusDistribution,
        bottleneckStatus: input.bottleneckStatus,
      };
    }
    const memberEntry = input.assigneeBreakdown.find(
      (entry) => entry.assigneeName === this.selectedMemberName,
    );
    if (memberEntry === undefined || memberEntry.statusMedians.length === 0) {
      return { entries: [], bottleneckStatus: '' };
    }
    const slowest = [...memberEntry.statusMedians].sort(
      (left, right) => right.medianHours - left.medianHours,
    )[0];
    return {
      entries: memberEntry.statusMedians,
      bottleneckStatus: slowest?.statusName ?? '',
    };
  }
}
