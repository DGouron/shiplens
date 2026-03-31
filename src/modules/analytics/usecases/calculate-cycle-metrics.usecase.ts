import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { CycleMetricsDataGateway } from '../entities/cycle-snapshot/cycle-metrics-data.gateway.js';
import { CycleSnapshot } from '../entities/cycle-snapshot/cycle-snapshot.js';
import { InsufficientHistoryError } from '../entities/cycle-snapshot/cycle-snapshot.errors.js';

interface CalculateCycleMetricsParams {
  cycleId: string;
  teamId: string;
  includeTrend?: boolean;
}

interface TrendResult {
  previousVelocities: number[];
}

interface CycleMetricsResult {
  velocity: { completedPoints: number; plannedPoints: number };
  throughput: number;
  completionRate: number;
  scopeCreep: number;
  averageCycleTimeInDays: number | null;
  averageLeadTimeInDays: number | null;
  trend?: TrendResult;
}

const MINIMUM_CYCLES_FOR_TREND = 3;

@Injectable()
export class CalculateCycleMetricsUsecase
  implements Usecase<CalculateCycleMetricsParams, CycleMetricsResult>
{
  constructor(
    private readonly cycleMetricsDataGateway: CycleMetricsDataGateway,
  ) {}

  async execute(params: CalculateCycleMetricsParams): Promise<CycleMetricsResult> {
    const snapshotData = await this.cycleMetricsDataGateway.getSnapshotData(
      params.cycleId,
      params.teamId,
    );

    const snapshot = CycleSnapshot.create(snapshotData);

    const result: CycleMetricsResult = {
      velocity: {
        completedPoints: snapshot.completedPoints,
        plannedPoints: snapshot.plannedPoints,
      },
      throughput: snapshot.throughput,
      completionRate: snapshot.completionRate,
      scopeCreep: snapshot.scopeCreep,
      averageCycleTimeInDays: snapshot.averageCycleTimeInDays,
      averageLeadTimeInDays: snapshot.averageLeadTimeInDays,
    };

    if (params.includeTrend) {
      const trendData = await this.cycleMetricsDataGateway.getTrendData(
        params.cycleId,
        params.teamId,
      );

      if (trendData.previousCompletedCycleCount < MINIMUM_CYCLES_FOR_TREND) {
        throw new InsufficientHistoryError();
      }

      result.trend = {
        previousVelocities: trendData.previousVelocities,
      };
    }

    return result;
  }
}
