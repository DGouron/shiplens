import { type EstimationAccuracyProps } from './estimation-accuracy.schema.js';

export abstract class EstimationAccuracyDataGateway {
  abstract getEstimationData(
    cycleId: string,
    teamId: string,
  ): Promise<EstimationAccuracyProps>;
  abstract getCompletedCycleIds(teamId: string): Promise<string[]>;
}
