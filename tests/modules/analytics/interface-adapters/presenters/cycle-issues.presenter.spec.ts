import { CycleIssuesPresenter } from '@modules/analytics/interface-adapters/presenters/cycle-issues.presenter.js';
import { describe, expect, it } from 'vitest';

describe('CycleIssuesPresenter', () => {
  const presenter = new CycleIssuesPresenter();

  it('formats issues with all fields', () => {
    const result = presenter.present({
      issues: [
        {
          externalId: 'issue-1',
          title: 'Fix login bug',
          statusName: 'Done',
          points: 3,
          assigneeName: 'Alice',
        },
      ],
    });

    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]).toEqual({
      externalId: 'issue-1',
      title: 'Fix login bug',
      statusName: 'Done',
      points: '3 pts',
      assigneeName: 'Alice',
    });
  });

  it('formats null points as dash', () => {
    const result = presenter.present({
      issues: [
        {
          externalId: 'issue-1',
          title: 'Unestimated',
          statusName: 'Backlog',
          points: null,
          assigneeName: null,
        },
      ],
    });

    expect(result.issues[0].points).toBe('-');
    expect(result.issues[0].assigneeName).toBe('Non assigné');
  });
});
