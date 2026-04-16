import { describe, expect, it } from 'vitest';
import { bottleneckAnalysisTranslations } from '@/modules/analytics/interface-adapters/presenters/bottleneck-analysis.translations.ts';

describe('bottleneckAnalysisTranslations', () => {
  it('exposes the same key set for en and fr', () => {
    const englishKeys = Object.keys(bottleneckAnalysisTranslations.en).sort();
    const frenchKeys = Object.keys(bottleneckAnalysisTranslations.fr).sort();

    expect(frenchKeys).toEqual(englishKeys);
  });

  it('has non-empty string values for every scalar translation', () => {
    const locales = ['en', 'fr'] as const;
    for (const locale of locales) {
      const bundle = bottleneckAnalysisTranslations[locale];
      for (const [key, value] of Object.entries(bundle)) {
        if (typeof value === 'string') {
          expect(
            value.length,
            `Empty string for ${locale}.${key}`,
          ).toBeGreaterThan(0);
        }
      }
    }
  });

  it('builds a bottleneck headline using the status name in both locales', () => {
    expect(
      bottleneckAnalysisTranslations.en.bottleneckHeadline('In Review'),
    ).toContain('In Review');
    expect(
      bottleneckAnalysisTranslations.fr.bottleneckHeadline('In Review'),
    ).toContain('In Review');
  });
});
