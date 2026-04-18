import { CycleThemesPresenter } from '@modules/analytics/interface-adapters/presenters/cycle-themes.presenter.js';
import { describe, expect, it } from 'vitest';

describe('CycleThemesPresenter', () => {
  const presenter = new CycleThemesPresenter();

  it('passes through no_active_cycle status', () => {
    const dto = presenter.present({ status: 'no_active_cycle' });

    expect(dto).toEqual({ status: 'no_active_cycle' });
  });

  it('passes through below_threshold status with issue count', () => {
    const dto = presenter.present({ status: 'below_threshold', issueCount: 7 });

    expect(dto).toEqual({ status: 'below_threshold', issueCount: 7 });
  });

  it('passes through ai_unavailable status', () => {
    const dto = presenter.present({ status: 'ai_unavailable' });

    expect(dto).toEqual({ status: 'ai_unavailable' });
  });

  it('formats ready status with themes sorted by issueCount descending', () => {
    const dto = presenter.present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
      language: 'EN',
      themes: [
        {
          name: 'A',
          issueCount: 3,
          totalPoints: 5,
          totalCycleTimeInHours: 8,
          issueExternalIds: ['a-1'],
        },
        {
          name: 'B',
          issueCount: 7,
          totalPoints: 12,
          totalCycleTimeInHours: 20,
          issueExternalIds: ['b-1'],
        },
        {
          name: 'C',
          issueCount: 5,
          totalPoints: 8,
          totalCycleTimeInHours: null,
          issueExternalIds: ['c-1'],
        },
      ],
      fromCache: false,
    });

    if (dto.status !== 'ready') {
      throw new Error('expected ready status');
    }
    expect(dto.cycleId).toBe('cycle-1');
    expect(dto.cycleName).toBe('Sprint 10');
    expect(dto.language).toBe('EN');
    expect(dto.fromCache).toBe(false);
    expect(dto.themes.map((row) => row.name)).toEqual(['B', 'C', 'A']);
    expect(dto.themes[0]).toEqual({
      name: 'B',
      issueCount: 7,
      totalPoints: 12,
      totalCycleTimeInHours: 20,
    });
  });

  it('breaks ties by theme name ascending', () => {
    const dto = presenter.present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
      language: 'EN',
      themes: [
        {
          name: 'Charlie',
          issueCount: 2,
          totalPoints: 0,
          totalCycleTimeInHours: null,
          issueExternalIds: ['c-1', 'c-2'],
        },
        {
          name: 'Alice',
          issueCount: 2,
          totalPoints: 0,
          totalCycleTimeInHours: null,
          issueExternalIds: ['a-1', 'a-2'],
        },
      ],
      fromCache: true,
    });

    if (dto.status !== 'ready') {
      throw new Error('expected ready status');
    }
    expect(dto.themes.map((row) => row.name)).toEqual(['Alice', 'Charlie']);
    expect(dto.fromCache).toBe(true);
  });
});
