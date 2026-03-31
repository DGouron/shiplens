import { describe, it, expect } from 'vitest';
import { TeamCyclesPresenter } from '@modules/analytics/interface-adapters/presenters/team-cycles.presenter.js';

describe('TeamCyclesPresenter', () => {
  const presenter = new TeamCyclesPresenter();

  it('formats cycle dates and status', () => {
    const result = presenter.present({
      cycles: [
        {
          externalId: 'cycle-1',
          teamId: 'team-1',
          name: 'Sprint 10',
          startsAt: '2026-01-01T00:00:00Z',
          endsAt: '2026-01-14T00:00:00Z',
          issueCount: 10,
          isActive: false,
        },
      ],
    });

    expect(result.cycles).toHaveLength(1);
    expect(result.cycles[0].externalId).toBe('cycle-1');
    expect(result.cycles[0].name).toBe('Sprint 10');
    expect(result.cycles[0].issueCount).toBe(10);
    expect(result.cycles[0].status).toBe('Terminé');
  });

  it('marks active cycle with status "Cycle en cours"', () => {
    const result = presenter.present({
      cycles: [
        {
          externalId: 'cycle-active',
          teamId: 'team-1',
          name: 'Sprint 12',
          startsAt: '2026-03-20T00:00:00Z',
          endsAt: '2099-04-03T00:00:00Z',
          issueCount: 5,
          isActive: true,
        },
      ],
    });

    expect(result.cycles[0].status).toBe('Cycle en cours');
  });
});
