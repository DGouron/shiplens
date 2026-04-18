import { CycleThemeIssuesPresenter } from '@modules/analytics/interface-adapters/presenters/cycle-theme-issues.presenter.js';
import { describe, expect, it } from 'vitest';

describe('CycleThemeIssuesPresenter', () => {
  const presenter = new CycleThemeIssuesPresenter();

  it('passes through no_active_cycle status', () => {
    const dto = presenter.present({ status: 'no_active_cycle' });

    expect(dto).toEqual({ status: 'no_active_cycle' });
  });

  it('passes through theme_not_found status', () => {
    const dto = presenter.present({ status: 'theme_not_found' });

    expect(dto).toEqual({ status: 'theme_not_found' });
  });

  it('formats ready status with the theme issues', () => {
    const dto = presenter.present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
      themeName: 'Auth',
      issues: [
        {
          externalId: 'issue-1',
          title: 'Fix login',
          assigneeName: 'Alice',
          points: 3,
          statusName: 'Done',
          linearUrl: 'https://linear.app/issue-1',
        },
      ],
    });

    if (dto.status !== 'ready') {
      throw new Error('expected ready status');
    }
    expect(dto.cycleId).toBe('cycle-1');
    expect(dto.themeName).toBe('Auth');
    expect(dto.issues).toEqual([
      {
        externalId: 'issue-1',
        title: 'Fix login',
        assigneeName: 'Alice',
        points: 3,
        statusName: 'Done',
        linearUrl: 'https://linear.app/issue-1',
      },
    ]);
  });
});
