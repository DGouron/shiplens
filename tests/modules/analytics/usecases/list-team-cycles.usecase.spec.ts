import { describe, it, expect, beforeEach } from 'vitest';
import { ListTeamCyclesUsecase } from '@modules/analytics/usecases/list-team-cycles.usecase.js';
import { StubCycleReportPageDataGateway } from '@modules/analytics/testing/good-path/stub.cycle-report-page-data.gateway.js';
import { DataNotSynchronizedError } from '@modules/analytics/entities/cycle-report-page/cycle-report-page.errors.js';

describe('ListTeamCyclesUsecase', () => {
  let gateway: StubCycleReportPageDataGateway;
  let usecase: ListTeamCyclesUsecase;

  beforeEach(() => {
    gateway = new StubCycleReportPageDataGateway();
    usecase = new ListTeamCyclesUsecase(gateway);
  });

  it('returns cycles sorted by most recent first', async () => {
    gateway.cycles = [
      {
        externalId: 'cycle-1',
        teamId: 'team-1',
        name: 'Sprint 10',
        startsAt: '2026-01-01T00:00:00Z',
        endsAt: '2026-01-14T00:00:00Z',
        issueCount: 10,
        isActive: false,
      },
      {
        externalId: 'cycle-2',
        teamId: 'team-1',
        name: 'Sprint 11',
        startsAt: '2026-01-15T00:00:00Z',
        endsAt: '2026-01-28T00:00:00Z',
        issueCount: 15,
        isActive: false,
      },
    ];

    const result = await usecase.execute({ teamId: 'team-1' });

    expect(result.cycles).toHaveLength(2);
    expect(result.cycles[0].externalId).toBe('cycle-2');
    expect(result.cycles[1].externalId).toBe('cycle-1');
  });

  it('throws DataNotSynchronizedError when data is not synced', async () => {
    gateway.synchronized = false;

    await expect(
      usecase.execute({ teamId: 'team-1' }),
    ).rejects.toThrow(DataNotSynchronizedError);
  });

  it('returns empty list when no cycles exist', async () => {
    gateway.cycles = [];

    const result = await usecase.execute({ teamId: 'team-1' });

    expect(result.cycles).toHaveLength(0);
  });

  it('marks active cycles correctly', async () => {
    gateway.cycles = [
      {
        externalId: 'cycle-active',
        teamId: 'team-1',
        name: 'Sprint 12',
        startsAt: '2026-03-20T00:00:00Z',
        endsAt: '2099-04-03T00:00:00Z',
        issueCount: 5,
        isActive: true,
      },
    ];

    const result = await usecase.execute({ teamId: 'team-1' });

    expect(result.cycles[0].isActive).toBe(true);
  });
});
