import { DataNotSynchronizedError } from '@modules/analytics/entities/cycle-report-page/cycle-report-page.errors.js';
import { StubCycleReportPageDataGateway } from '@modules/analytics/testing/good-path/stub.cycle-report-page-data.gateway.js';
import { GetCycleIssuesUsecase } from '@modules/analytics/usecases/get-cycle-issues.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('GetCycleIssuesUsecase', () => {
  let gateway: StubCycleReportPageDataGateway;
  let usecase: GetCycleIssuesUsecase;

  beforeEach(() => {
    gateway = new StubCycleReportPageDataGateway();
    usecase = new GetCycleIssuesUsecase(gateway);
  });

  it('returns issues for a cycle', async () => {
    gateway.issues = [
      {
        externalId: 'issue-1',
        title: 'Fix login bug',
        statusName: 'Done',
        points: 3,
        assigneeName: 'Alice',
      },
      {
        externalId: 'issue-2',
        title: 'Add dark mode',
        statusName: 'In Progress',
        points: 5,
        assigneeName: 'Bob',
      },
    ];

    const result = await usecase.execute({
      cycleId: 'cycle-1',
      teamId: 'team-1',
    });

    expect(result.issues).toHaveLength(2);
    expect(result.issues[0].title).toBe('Fix login bug');
    expect(result.issues[1].assigneeName).toBe('Bob');
  });

  it('throws DataNotSynchronizedError when data is not synced', async () => {
    gateway.synchronized = false;

    await expect(
      usecase.execute({ cycleId: 'cycle-1', teamId: 'team-1' }),
    ).rejects.toThrow(DataNotSynchronizedError);
  });

  it('returns empty list when cycle has no issues', async () => {
    gateway.issues = [];

    const result = await usecase.execute({
      cycleId: 'cycle-1',
      teamId: 'team-1',
    });

    expect(result.issues).toHaveLength(0);
  });

  it('handles issues with null points and assignee', async () => {
    gateway.issues = [
      {
        externalId: 'issue-1',
        title: 'Unestimated task',
        statusName: 'Backlog',
        points: null,
        assigneeName: null,
      },
    ];

    const result = await usecase.execute({
      cycleId: 'cycle-1',
      teamId: 'team-1',
    });

    expect(result.issues[0].points).toBeNull();
    expect(result.issues[0].assigneeName).toBeNull();
  });
});
