import { describe, expect, it } from 'vitest';
import { memberFilterTranslations } from '@/modules/analytics/interface-adapters/presenters/member-filter.translations.ts';

describe('memberFilterTranslations', () => {
  it('exposes the same key set for en and fr', () => {
    const englishKeys = Object.keys(memberFilterTranslations.en).sort();
    const frenchKeys = Object.keys(memberFilterTranslations.fr).sort();

    expect(frenchKeys).toEqual(englishKeys);
  });

  it('has non-empty string values for every translation', () => {
    const allValues = [
      ...Object.values(memberFilterTranslations.en),
      ...Object.values(memberFilterTranslations.fr),
    ];

    for (const value of allValues) {
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    }
  });
});
