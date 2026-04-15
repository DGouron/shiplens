import { describe, expect, it } from 'vitest';
import { cycleReportShellTranslations } from '@/modules/analytics/interface-adapters/presenters/cycle-report-shell.translations.ts';

describe('cycleReportShellTranslations', () => {
  it('exposes the same key set for en and fr', () => {
    const englishKeys = Object.keys(cycleReportShellTranslations.en).sort();
    const frenchKeys = Object.keys(cycleReportShellTranslations.fr).sort();

    expect(frenchKeys).toEqual(englishKeys);
  });

  it('has non-empty string values for every translation', () => {
    const allValues = [
      ...Object.values(cycleReportShellTranslations.en),
      ...Object.values(cycleReportShellTranslations.fr),
    ];

    for (const value of allValues) {
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    }
  });
});
