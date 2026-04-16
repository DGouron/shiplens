import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';
import { type BottleneckAnalysisResult } from '../../usecases/analyze-bottlenecks-by-status.usecase.js';

interface StatusDistributionDto {
  statusName: string;
  medianHours: number;
}

interface AssigneeBreakdownDto {
  assigneeName: string;
  statusMedians: StatusDistributionDto[];
}

interface CycleComparisonDto {
  statusName: string;
  previousMedianHours: number;
  currentMedianHours: number;
  evolutionPercent: number;
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
        medianHours: entry.medianHours,
      })),
      bottleneckStatus: input.bottleneckStatus,
      assigneeBreakdown: input.assigneeBreakdown.map((entry) => ({
        assigneeName: entry.assigneeName,
        statusMedians: entry.statusMedians.map((median) => ({
          statusName: median.statusName,
          medianHours: median.medianHours,
        })),
      })),
      cycleComparison: input.cycleComparison
        ? input.cycleComparison.map((entry) => ({
            statusName: entry.statusName,
            previousMedianHours: entry.previousMedianHours,
            currentMedianHours: entry.currentMedianHours,
            evolutionPercent: entry.evolutionPercent,
          }))
        : null,
    };
  }
}
