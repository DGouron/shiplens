import { Injectable, Logger } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { NoSynchronizedDataError } from '../entities/bottleneck-analysis/bottleneck-analysis.errors.js';
import { BottleneckAnalysis } from '../entities/bottleneck-analysis/bottleneck-analysis.js';
import { BottleneckAnalysisDataGateway } from '../entities/bottleneck-analysis/bottleneck-analysis-data.gateway.js';

interface AnalyzeBottlenecksParams {
  cycleId: string;
  teamId: string;
  includeComparison?: boolean;
}

interface StatusMedianResult {
  statusName: string;
  medianHours: number;
}

interface AssigneeBreakdownResult {
  assigneeName: string;
  statusMedians: StatusMedianResult[];
}

interface CycleComparisonResult {
  statusName: string;
  previousMedianHours: number;
  currentMedianHours: number;
  evolutionPercent: number;
}

export interface BottleneckAnalysisResult {
  statusDistribution: StatusMedianResult[];
  bottleneckStatus: string;
  assigneeBreakdown: AssigneeBreakdownResult[];
  cycleComparison: CycleComparisonResult[] | null;
}

@Injectable()
export class AnalyzeBottlenecksByStatusUsecase
  implements Usecase<AnalyzeBottlenecksParams, BottleneckAnalysisResult>
{
  private readonly logger = new Logger(AnalyzeBottlenecksByStatusUsecase.name);

  constructor(
    private readonly bottleneckDataGateway: BottleneckAnalysisDataGateway,
  ) {}

  async execute(
    params: AnalyzeBottlenecksParams,
  ): Promise<BottleneckAnalysisResult> {
    this.logger.log(`[${params.cycleId}] Bottleneck analysis started`);

    const hasSyncData = await this.bottleneckDataGateway.hasSynchronizedData(
      params.teamId,
    );
    if (!hasSyncData) {
      throw new NoSynchronizedDataError();
    }

    const data = await this.bottleneckDataGateway.getBottleneckData(
      params.cycleId,
      params.teamId,
    );

    let previousCycleMedians: Record<string, number> | undefined;

    if (params.includeComparison) {
      const previousCycleId =
        await this.bottleneckDataGateway.getPreviousCycleId(
          params.cycleId,
          params.teamId,
        );

      if (previousCycleId) {
        const previousData = await this.bottleneckDataGateway.getBottleneckData(
          previousCycleId,
          params.teamId,
        );
        const previousAnalysis = BottleneckAnalysis.create(previousData);
        previousCycleMedians = previousAnalysis.mediansAsRecord;
      }
    }

    const analysis = BottleneckAnalysis.create({
      ...data,
      previousCycleMedians,
    });

    const result = {
      statusDistribution: analysis.statusDistribution,
      bottleneckStatus: analysis.bottleneckStatus,
      assigneeBreakdown: analysis.assigneeBreakdown,
      cycleComparison: analysis.cycleComparison,
    };

    this.logger.log(
      `[${params.cycleId}] Bottleneck analysis completed — bottleneck: ${result.bottleneckStatus}, statuses: ${result.statusDistribution.length}, assignees: ${result.assigneeBreakdown.length}`,
    );

    return result;
  }
}
