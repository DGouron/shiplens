import {
  EstimationAccuracyGateway,
  type FetchEstimationAccuracyParams,
} from '../../entities/estimation-accuracy/estimation-accuracy.gateway.ts';
import { type EstimationAccuracyResponse } from '../../entities/estimation-accuracy/estimation-accuracy.response.ts';

interface StubEstimationAccuracyGatewayOptions {
  response?: EstimationAccuracyResponse;
}

const defaultResponse: EstimationAccuracyResponse = {
  issues: [
    {
      externalId: 'LIN-1',
      title: 'Sample issue',
      points: 2,
      cycleTimeInDays: 3,
      ratio: 1,
      daysPerPoint: 1.5,
      classification: 'well-estimated',
    },
  ],
  developerScores: [],
  labelScores: [],
  excludedWithoutEstimation: 0,
  excludedWithoutCycleTime: 0,
};

export class StubEstimationAccuracyGateway extends EstimationAccuracyGateway {
  private readonly response: EstimationAccuracyResponse;
  calls: FetchEstimationAccuracyParams[] = [];

  constructor(options: StubEstimationAccuracyGatewayOptions = {}) {
    super();
    this.response = options.response ?? defaultResponse;
  }

  async fetchEstimationAccuracy(
    params: FetchEstimationAccuracyParams,
  ): Promise<EstimationAccuracyResponse> {
    this.calls.push(params);
    return {
      issues: this.response.issues.map((issue) => ({ ...issue })),
      developerScores: this.response.developerScores.map((score) => ({
        ...score,
      })),
      labelScores: this.response.labelScores.map((score) => ({ ...score })),
      excludedWithoutEstimation: this.response.excludedWithoutEstimation,
      excludedWithoutCycleTime: this.response.excludedWithoutCycleTime,
    };
  }
}
