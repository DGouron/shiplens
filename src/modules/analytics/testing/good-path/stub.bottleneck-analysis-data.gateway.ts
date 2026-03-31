import { BottleneckAnalysisDataGateway } from '../../entities/bottleneck-analysis/bottleneck-analysis-data.gateway.js';
import { type BottleneckAnalysisProps } from '../../entities/bottleneck-analysis/bottleneck-analysis.schema.js';

export class StubBottleneckAnalysisDataGateway extends BottleneckAnalysisDataGateway {
  bottleneckData: BottleneckAnalysisProps = {
    cycleId: 'cycle-1',
    teamId: 'team-1',
    completedIssues: [
      {
        externalId: 'issue-1',
        assigneeName: 'Alice',
        transitions: [
          { toStatusName: 'Backlog', occurredAt: '2026-01-01T00:00:00Z' },
          { toStatusName: 'Todo', occurredAt: '2026-01-01T04:00:00Z' },
          { toStatusName: 'In Progress', occurredAt: '2026-01-01T08:00:00Z' },
          { toStatusName: 'In Review', occurredAt: '2026-01-02T08:00:00Z' },
          { toStatusName: 'Done', occurredAt: '2026-01-03T20:00:00Z' },
        ],
      },
    ],
  };

  previousCycleId: string | null = null;
  hasSyncData = true;

  async getBottleneckData(): Promise<BottleneckAnalysisProps> {
    return this.bottleneckData;
  }

  async getPreviousCycleId(): Promise<string | null> {
    return this.previousCycleId;
  }

  async hasSynchronizedData(): Promise<boolean> {
    return this.hasSyncData;
  }
}
