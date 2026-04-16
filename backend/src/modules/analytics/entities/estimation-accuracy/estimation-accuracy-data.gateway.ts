import { type EstimationAccuracyProps } from './estimation-accuracy.schema.js';

export abstract class EstimationAccuracyDataGateway {
  abstract getEstimationData(
    cycleId: string,
    teamId: string,
    startedStatuses: readonly string[],
    completedStatuses: readonly string[],
  ): Promise<EstimationAccuracyProps>;
  abstract getCompletedCycleIds(teamId: string): Promise<string[]>;
}
