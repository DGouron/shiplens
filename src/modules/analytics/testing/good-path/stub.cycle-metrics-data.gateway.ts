import { CycleMetricsDataGateway, type TrendData } from '../../entities/cycle-snapshot/cycle-metrics-data.gateway.js';
import { type CycleSnapshotProps } from '../../entities/cycle-snapshot/cycle-snapshot.schema.js';

export class StubCycleMetricsDataGateway extends CycleMetricsDataGateway {
  snapshotData: CycleSnapshotProps = {
    cycleId: 'cycle-1',
    teamId: 'team-1',
    cycleName: 'Sprint 10',
    startsAt: '2026-01-01T00:00:00Z',
    endsAt: '2026-01-14T00:00:00Z',
    issues: [],
  };

  previousCompletedCycleCount = 0;
  previousVelocities: number[] = [];

  async getSnapshotData(): Promise<CycleSnapshotProps> {
    return this.snapshotData;
  }

  async getTrendData(): Promise<TrendData> {
    return {
      previousCompletedCycleCount: this.previousCompletedCycleCount,
      previousVelocities: this.previousVelocities,
    };
  }
}
