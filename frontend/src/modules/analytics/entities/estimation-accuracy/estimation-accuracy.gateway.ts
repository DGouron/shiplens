import { type EstimationAccuracyResponse } from './estimation-accuracy.response.ts';

export interface FetchEstimationAccuracyParams {
  teamId: string;
  cycleId: string;
}

export abstract class EstimationAccuracyGateway {
  abstract fetchEstimationAccuracy(
    params: FetchEstimationAccuracyParams,
  ): Promise<EstimationAccuracyResponse>;
}
