import { type CycleSnapshotProps } from './cycle-snapshot.schema.js';

export interface TrendData {
  previousCompletedCycleCount: number;
  previousVelocities: number[];
}

export abstract class CycleMetricsDataGateway {
  abstract getSnapshotData(
    cycleId: string,
    teamId: string,
  ): Promise<CycleSnapshotProps>;
  abstract getTrendData(cycleId: string, teamId: string): Promise<TrendData>;
}
