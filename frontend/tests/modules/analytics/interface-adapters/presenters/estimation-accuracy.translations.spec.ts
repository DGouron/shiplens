import { describe, expect, it } from 'vitest';
import { estimationAccuracyTranslations } from '@/modules/analytics/interface-adapters/presenters/estimation-accuracy.translations.ts';

describe('estimationAccuracyTranslations', () => {
  it('exposes the same key set for en and fr', () => {
    const englishKeys = Object.keys(estimationAccuracyTranslations.en).sort();
    const frenchKeys = Object.keys(estimationAccuracyTranslations.fr).sort();

    expect(frenchKeys).toEqual(englishKeys);
  });

  it('has non-empty string labels for every plain-string translation', () => {
    const bundles = [
      estimationAccuracyTranslations.en,
      estimationAccuracyTranslations.fr,
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
