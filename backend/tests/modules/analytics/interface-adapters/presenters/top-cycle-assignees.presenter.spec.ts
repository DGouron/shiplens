import { TopCycleAssigneesPresenter } from '@modules/analytics/interface-adapters/presenters/top-cycle-assignees.presenter.js';
import { describe, expect, it } from 'vitest';

describe('TopCycleAssigneesPresenter', () => {
  const presenter = new TopCycleAssigneesPresenter();

  it('presents no_active_cycle as a discriminated DTO', () => {
    const result = presenter.present({ status: 'no_active_cycle' });

    expect(result).toEqual({ status: 'no_active_cycle' });
  });

  it('presents ready result with cycle info and empty assignees when no aggregates', () => {
    const result = presenter.present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
      aggregates: [],
    });

    expect(result).toEqual({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
      assignees: [],
    });
  });

  it('maps an assignee aggregate to an assignee row DTO', () => {
    const result = presenter.present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
      aggregates: [
        {
          assigneeName: 'Alice',
          issueCount: 3,
          totalPoints: 8,
          totalCycleTimeInHours: 12,
        },
      ],
    });

    if (result.status !== 'ready') {
      throw new Error('expected ready status');
    }
    expect(result.assignees).toHaveLength(1);
    expect(result.assignees[0]).toEqual({
      assigneeName: 'Alice',
      issueCount: 3,
      totalPoints: 8,
      totalCycleTimeInHours: 12,
    });
  });

  it('sorts assignees by issueCount descending', () => {
    const result = presenter.present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
      aggregates: [
        {
          assigneeName: 'Bob',
          issueCount: 3,
          totalPoints: 5,
          totalCycleTimeInHours: 4,
        },
        {
          assigneeName: 'Alice',
          issueCount: 5,
          totalPoints: 2,
          totalCycleTimeInHours: 10,
        },
      ],
    });

    if (result.status !== 'ready') {
      throw new Error('expected ready status');
    }
    expect(result.assignees.map((row) => row.assigneeName)).toEqual([
      'Alice',
      'Bob',
    ]);
  });

  it('tie-breaks equal issueCount by assigneeName ascending', () => {
    const result = presenter.present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
      aggregates: [
        {
          assigneeName: 'Charlie',
          issueCount: 3,
          totalPoints: 0,
          totalCycleTimeInHours: 0,
        },
        {
          assigneeName: 'Alice',
          issueCount: 3,
          totalPoints: 0,
          totalCycleTimeInHours: 0,
        },
        {
          assigneeName: 'Bob',
          issueCount: 3,
          totalPoints: 0,
          totalCycleTimeInHours: 0,
        },
      ],
    });

    if (result.status !== 'ready') {
      throw new Error('expected ready status');
    }
    expect(result.assignees.map((row) => row.assigneeName)).toEqual([
      'Alice',
      'Bob',
      'Charlie',
    ]);
  });

  it('truncates the ranking to the top 5 assignees', () => {
    const result = presenter.present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
      aggregates: Array.from({ length: 8 }, (_, index) => ({
        assigneeName: `Member ${index}`,
        issueCount: 20 - index,
        totalPoints: 0,
        totalCycleTimeInHours: 0,
      })),
    });

    if (result.status !== 'ready') {
      throw new Error('expected ready status');
    }
    expect(result.assignees).toHaveLength(5);
    expect(result.assignees.map((row) => row.assigneeName)).toEqual([
      'Member 0',
      'Member 1',
      'Member 2',
      'Member 3',
      'Member 4',
    ]);
  });
});
