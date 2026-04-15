import { describe, expect, it } from 'vitest';
import { dashboardTranslations } from '@/modules/analytics/interface-adapters/presenters/dashboard.translations.ts';

describe('dashboardTranslations', () => {
  it('exposes the same key set for en and fr', () => {
    const englishKeys = Object.keys(dashboardTranslations.en).sort();
    const frenchKeys = Object.keys(dashboardTranslations.fr).sort();

    expect(frenchKeys).toEqual(englishKeys);
  });

  it('has non-empty string values for every translation', () => {
    const allValues = [
      ...Object.values(dashboardTranslations.en),
      ...Object.values(dashboardTranslations.fr),
    ];

    for (const value of allValues) {
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    }
  });
});
