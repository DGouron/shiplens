import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { EstimationAccuracyDataGateway } from '../entities/estimation-accuracy/estimation-accuracy-data.gateway.js';
import { EstimationAccuracy } from '../entities/estimation-accuracy/estimation-accuracy.js';
import { InsufficientHistoryForTrendError } from '../entities/estimation-accuracy/estimation-accuracy.errors.js';

interface GetEstimationTrendParams {
  teamId: string;
}

export interface CycleTrendEntry {
  cycleId: string;
  averageRatio: number;
  classification: 'over-estimated' | 'under-estimated' | 'well-estimated';
}

const MINIMUM_CYCLES_FOR_TREND = 2;

@Injectable()
export class GetEstimationTrendUsecase
  implements Usecase<GetEstimationTrendParams, CycleTrendEntry[]>
{
  constructor(
    private readonly estimationAccuracyDataGateway: EstimationAccuracyDataGateway,
  ) {}

  async execute(params: GetEstimationTrendParams): Promise<CycleTrendEntry[]> {
    const cycleIds = await this.estimationAccuracyDataGateway.getCompletedCycleIds(
      params.teamId,
    );

    if (cycleIds.length < MINIMUM_CYCLES_FOR_TREND) {
      throw new InsufficientHistoryForTrendError();
    }

    const trend: CycleTrendEntry[] = [];

    for (const cycleId of cycleIds) {
      const data = await this.estimationAccuracyDataGateway.getEstimationData(
        cycleId,
        params.teamId,
      );

      const accuracy = EstimationAccuracy.create(data);
      const teamScore = accuracy.teamScore();

      trend.push({
        cycleId,
        averageRatio: teamScore.averageRatio,
        classification: teamScore.classification,
      });
    }

    return trend;
  }
}
