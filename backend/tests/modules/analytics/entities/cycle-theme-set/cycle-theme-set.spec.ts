import { CycleThemeSet } from '@modules/analytics/entities/cycle-theme-set/cycle-theme-set.js';
import { describe, expect, it } from 'vitest';

const validProps = {
  cycleId: 'cycle-1',
  teamId: 'team-1',
  language: 'EN' as const,
  themes: [{ name: 'Auth', issueExternalIds: ['issue-1'] }],
  generatedAt: '2026-04-18T10:00:00.000Z',
};

describe('CycleThemeSet', () => {
  it('creates from valid props', () => {
    const themeSet = CycleThemeSet.create(validProps);

    expect(themeSet.cycleId).toBe('cycle-1');
    expect(themeSet.teamId).toBe('team-1');
    expect(themeSet.language).toBe('EN');
    expect(themeSet.themes).toEqual([
      { name: 'Auth', issueExternalIds: ['issue-1'] },
    ]);
    expect(themeSet.generatedAt).toBe('2026-04-18T10:00:00.000Z');
  });

  it('rejects themes array with zero entries', () => {
    expect(() =>
      CycleThemeSet.create({
        ...validProps,
        themes: [],
      }),
    ).toThrow();
  });

  it('rejects themes array with more than 5 entries', () => {
    expect(() =>
      CycleThemeSet.create({
        ...validProps,
        themes: Array.from({ length: 6 }, (_, index) => ({
          name: `Theme ${index}`,
          issueExternalIds: [`issue-${index}`],
        })),
      }),
    ).toThrow();
  });

  it('rejects a theme with an empty name', () => {
    expect(() =>
      CycleThemeSet.create({
        ...validProps,
        themes: [{ name: '', issueExternalIds: ['issue-1'] }],
      }),
    ).toThrow();
  });

  it('rejects a theme with a name longer than 60 characters', () => {
    expect(() =>
      CycleThemeSet.create({
        ...validProps,
        themes: [
          {
            name: 'a'.repeat(61),
            issueExternalIds: ['issue-1'],
          },
        ],
      }),
    ).toThrow();
  });

  it('rejects a theme with no issueExternalIds', () => {
    expect(() =>
      CycleThemeSet.create({
        ...validProps,
        themes: [{ name: 'Auth', issueExternalIds: [] }],
      }),
    ).toThrow();
  });

  it('isCachedWithin returns true when age is below ttl', () => {
    const now = '2026-04-18T10:00:00.000Z';
    const threeHoursAgo = '2026-04-18T07:00:00.000Z';
    const themeSet = CycleThemeSet.create({
      ...validProps,
      generatedAt: threeHoursAgo,
    });
    const twentyFourHours = 24 * 60 * 60 * 1000;

    expect(themeSet.isCachedWithin(now, twentyFourHours)).toBe(true);
  });

  it('isCachedWithin returns false when age exceeds ttl', () => {
    const now = '2026-04-18T10:00:00.000Z';
    const yesterday = '2026-04-17T09:00:00.000Z';
    const themeSet = CycleThemeSet.create({
      ...validProps,
      generatedAt: yesterday,
    });
    const twentyFourHours = 24 * 60 * 60 * 1000;

    expect(themeSet.isCachedWithin(now, twentyFourHours)).toBe(false);
  });
});
