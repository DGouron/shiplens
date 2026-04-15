import { describe, expect, it } from 'vitest';
import { blockedIssuesTranslations } from '@/modules/analytics/interface-adapters/presenters/blocked-issues.translations.ts';

describe('blockedIssuesTranslations', () => {
  it('exposes the same key set for en and fr', () => {
    const englishKeys = Object.keys(blockedIssuesTranslations.en).sort();
    const frenchKeys = Object.keys(blockedIssuesTranslations.fr).sort();

    expect(frenchKeys).toEqual(englishKeys);
  });

  it('has non-empty string values for every translation', () => {
    const allValues = [
      ...Object.values(blockedIssuesTranslations.en),
      ...Object.values(blockedIssuesTranslations.fr),
    ];

    for (const value of allValues) {
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    }
  });
});
