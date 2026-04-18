import { CycleAssigneeIssuesPresenter } from '@modules/analytics/interface-adapters/presenters/cycle-assignee-issues.presenter.js';
import { describe, expect, it } from 'vitest';

describe('CycleAssigneeIssuesPresenter', () => {
  const presenter = new CycleAssigneeIssuesPresenter();

  it('presents no_active_cycle as a discriminated DTO', () => {
    const result = presenter.present({ status: 'no_active_cycle' });

    expect(result).toEqual({ status: 'no_active_cycle' });
  });

  it('presents ready result with issues for the selected assignee', () => {
    const result = presenter.present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
      assigneeName: 'Alice',
      issues: [
        {
          externalId: 'issue-1',
          title: 'Fix login',
          points: 3,
          totalCycleTimeInHours: 12,
          statusName: 'Done',
        },
      ],
    });

    expect(result).toEqual({
      status: 'ready',
      cycleId: 'cycle-1',
      assigneeName: 'Alice',
      issues: [
        {
          externalId: 'issue-1',
          title: 'Fix login',
          points: 3,
          totalCycleTimeInHours: 12,
          statusName: 'Done',
        },
      ],
    });
  });

  it('maps an empty issues array when the assignee has no completed work', () => {
    const result = presenter.present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
      assigneeName: 'Diana',
      issues: [],
    });

    if (result.status !== 'ready') {
      throw new Error('expected ready status');
    }
    expect(result.issues).toEqual([]);
  });
});
