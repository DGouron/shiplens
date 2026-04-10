import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';
import { type BottleneckAnalysisResult } from '../../usecases/analyze-bottlenecks-by-status.usecase.js';
import { formatDuration } from './format-duration.js';

interface StatusDistributionDto {
  statusName: string;
  medianHours: string;
}

interface AssigneeBreakdownDto {
  assigneeName: string;
  statusMedians: StatusDistributionDto[];
}

interface CycleComparisonDto {
  statusName: string;
  previousMedianHours: string;
  currentMedianHours: string;
  evolution: string;
}

export interface BottleneckAnalysisDto {
  statusDistribution: StatusDistributionDto[];
  bottleneckStatus: string;
  assigneeBreakdown: AssigneeBreakdownDto[];
  cycleComparison: CycleComparisonDto[] | null;
}

@Injectable()
export class BottleneckAnalysisPresenter
  implements Presenter<BottleneckAnalysisResult, BottleneckAnalysisDto>
{
  present(input: BottleneckAnalysisResult): BottleneckAnalysisDto {
    return {
      statusDistribution: input.statusDistribution.map((entry) => ({
        statusName: entry.statusName,
        medianHours: formatDuration(entry.medianHours),
      })),
      bottleneckStatus: input.bottleneckStatus,
      assigneeBreakdown: input.assigneeBreakdown.map((entry) => ({
        assigneeName: entry.assigneeName,
        statusMedians: entry.statusMedians.map((median) => ({
          statusName: median.statusName,
          medianHours: formatDuration(median.medianHours),
        })),
      })),
      cycleComparison: input.cycleComparison
        ? input.cycleComparison.map((entry) => ({
            statusName: entry.statusName,
            previousMedianHours: formatDuration(entry.previousMedianHours),
            currentMedianHours: formatDuration(entry.currentMedianHours),
            evolution: `${entry.evolutionPercent}%`,
          }))
        : null,
    };
  }
}
