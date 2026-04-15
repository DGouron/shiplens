import { type Presenter } from '@/shared/foundation/presenter/presenter.ts';
import { type BottleneckAnalysisResponse } from '../../entities/bottleneck-analysis/bottleneck-analysis.response.ts';
import { type BottleneckAnalysisTranslations } from './bottleneck-analysis.translations.ts';
import {
  type BottleneckAnalysisViewModel,
  type BottleneckRowViewModel,
} from './bottleneck-analysis.view-model.schema.ts';
import { formatDurationHours } from './format-duration-hours.ts';

export class BottleneckAnalysisPresenter
  implements Presenter<BottleneckAnalysisResponse, BottleneckAnalysisViewModel>
{
  constructor(private readonly translations: BottleneckAnalysisTranslations) {}

  present(input: BottleneckAnalysisResponse): BottleneckAnalysisViewModel {
    if (input.statusDistribution.length === 0) {
      return {
        rows: [],
        bottleneckHeadline: this.translations.noBottleneckHeadline,
        emptyMessage: this.translations.emptyMessage,
        showTable: false,
        showEmptyMessage: true,
      };
    }
    const sorted = [...input.statusDistribution].sort(
      (left, right) => right.medianHours - left.medianHours,
    );
    const rows: BottleneckRowViewModel[] = sorted.map((entry) => ({
      statusName: entry.statusName,
      medianHoursLabel: formatDurationHours(entry.medianHours, {
        daysSuffix: this.translations.daysSuffix,
      }),
      isBottleneck: entry.statusName === input.bottleneckStatus,
    }));
    return {
      rows,
      bottleneckHeadline: this.translations.bottleneckHeadline(
        input.bottleneckStatus,
      ),
      emptyMessage: null,
      showTable: true,
      showEmptyMessage: false,
    };
  }
}
