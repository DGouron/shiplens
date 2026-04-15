import { describe, expect, it } from 'vitest';
import { cycleMetricsTranslations } from '@/modules/analytics/interface-adapters/presenters/cycle-metrics.translations.ts';

describe('cycleMetricsTranslations', () => {
  it('exposes the same key set for en and fr', () => {
    const englishKeys = Object.keys(cycleMetricsTranslations.en).sort();
    const frenchKeys = Object.keys(cycleMetricsTranslations.fr).sort();

    expect(frenchKeys).toEqual(englishKeys);
  });

  it('has non-empty string values for every translation', () => {
    const allValues = [
      ...Object.values(cycleMetricsTranslations.en),
      ...Object.values(cycleMetricsTranslations.fr),
    ];

    for (const value of allValues) {
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    }
  });
});
