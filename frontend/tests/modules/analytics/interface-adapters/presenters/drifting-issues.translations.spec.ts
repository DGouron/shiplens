import { describe, expect, it } from 'vitest';
import { driftingIssuesTranslations } from '@/modules/analytics/interface-adapters/presenters/drifting-issues.translations.ts';

describe('driftingIssuesTranslations', () => {
  it('exposes the same key set for en and fr', () => {
    const englishKeys = Object.keys(driftingIssuesTranslations.en).sort();
    const frenchKeys = Object.keys(driftingIssuesTranslations.fr).sort();

    expect(frenchKeys).toEqual(englishKeys);
  });

  it('has non-empty string labels for every plain-string translation', () => {
    const bundles = [
      driftingIssuesTranslations.en,
      driftingIssuesTranslations.fr,
    ];

    for (const bundle of bundles) {
      for (const value of Object.values(bundle)) {
        if (typeof value === 'string') {
          expect(value.length).toBeGreaterThan(0);
        } else {
          expect(typeof value).toBe('function');
        }
      }
    }
  });
});
