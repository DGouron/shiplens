import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';

interface CycleMetricsInput {
  velocity: { completedPoints: number; plannedPoints: number };
  throughput: number;
  completionRate: number;
  scopeCreep: number;
  averageCycleTimeInDays: number | null;
  averageLeadTimeInDays: number | null;
  trend?: { previousVelocities: number[] };
}

interface TrendDto {
  previousVelocities: number[];
}

export interface CycleMetricsDto {
  velocity: string;
  throughput: string;
  completionRate: string;
  scopeCreep: string;
  averageCycleTime: string;
  averageLeadTime: string;
  trend?: TrendDto;
}

@Injectable()
export class CycleMetricsPresenter
  implements Presenter<CycleMetricsInput, CycleMetricsDto>
{
  present(input: CycleMetricsInput): CycleMetricsDto {
    const dto: CycleMetricsDto = {
      velocity: `${input.velocity.completedPoints}/${input.velocity.plannedPoints} points`,
      throughput: `${input.throughput} issues`,
      completionRate: `${input.completionRate}%`,
      scopeCreep: `${input.scopeCreep} issues ajoutees`,
      averageCycleTime:
        input.averageCycleTimeInDays !== null
          ? `${parseFloat(input.averageCycleTimeInDays.toFixed(1))} jours`
          : 'Non disponible',
      averageLeadTime:
        input.averageLeadTimeInDays !== null
          ? `${parseFloat(input.averageLeadTimeInDays.toFixed(1))} jours`
          : 'Non disponible',
    };

    if (input.trend) {
      dto.trend = {
        previousVelocities: input.trend.previousVelocities,
      };
    }

    return dto;
  }
}
