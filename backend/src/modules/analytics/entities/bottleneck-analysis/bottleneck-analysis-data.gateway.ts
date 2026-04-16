import { type BottleneckAnalysisProps } from './bottleneck-analysis.schema.js';

export abstract class BottleneckAnalysisDataGateway {
  abstract getBottleneckData(
    cycleId: string,
    teamId: string,
    completedStatuses: readonly string[],
  ): Promise<BottleneckAnalysisProps>;
  abstract getPreviousCycleId(
    cycleId: string,
    teamId: string,
  ): Promise<string | null>;
  abstract hasSynchronizedData(teamId: string): Promise<boolean>;
}
