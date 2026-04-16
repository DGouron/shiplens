import {
  type SprintContext,
  SprintReportDataGateway,
  type TrendContext,
} from '../../entities/sprint-report/sprint-report-data.gateway.js';

export class StubSprintReportDataGateway extends SprintReportDataGateway {
  synchronized = true;

  sprintContext: SprintContext = {
    cycleId: 'cycle-1',
    teamId: 'team-1',
    cycleName: 'Sprint 10',
    startsAt: '2026-01-01T00:00:00Z',
    endsAt: '2026-01-14T00:00:00Z',
    issues: [
      {
        externalId: 'issue-1',
        title: 'Default Issue',
        statusName: 'Done',
        points: 3,
        createdAt: '2026-01-01T00:00:00Z',
        completedAt: '2026-01-10T00:00:00Z',
        startedAt: '2026-01-05T00:00:00Z',
      },
    ],
  };

  trendContext: TrendContext | null = null;

  async isSynchronized(): Promise<boolean> {
    return this.synchronized;
  }

  async getSprintContext(
    _cycleId?: string,
    _teamId?: string,
    _startedStatuses?: readonly string[],
    _completedStatuses?: readonly string[],
  ): Promise<SprintContext> {
    return this.sprintContext;
  }

  async getTrendContext(
    _cycleId?: string,
    _teamId?: string,
    _completedStatuses?: readonly string[],
  ): Promise<TrendContext | null> {
    return this.trendContext;
  }
}
