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

export interface VelocityDto {
  completedPoints: number;
  plannedPoints: number;
}

export interface CycleMetricsDto {
  velocity: VelocityDto;
  throughput: number;
  completionRate: number;
  scopeCreep: number;
  averageCycleTimeInDays: number | null;
  averageLeadTimeInDays: number | null;
  trend?: TrendDto;
}

@Injectable()
export class CycleMetricsPresenter
  implements Presenter<CycleMetricsInput, CycleMetricsDto>
{
  present(input: CycleMetricsInput): CycleMetricsDto {
    const dto: CycleMetricsDto = {
      velocity: {
        completedPoints: input.velocity.completedPoints,
        plannedPoints: input.velocity.plannedPoints,
      },
      throughput: input.throughput,
      completionRate: input.completionRate,
      scopeCreep: input.scopeCreep,
      averageCycleTimeInDays: input.averageCycleTimeInDays,
      averageLeadTimeInDays: input.averageLeadTimeInDays,
    };

    if (input.trend) {
      dto.trend = {
        previousVelocities: input.trend.previousVelocities,
      };
    }

    return dto;
  }
}
