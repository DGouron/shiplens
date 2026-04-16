import { describe, expect, it } from 'vitest';
import { formatDurationHours } from '@/modules/analytics/interface-adapters/presenters/format-duration-hours.ts';

const englishTranslations = { daysSuffix: 'days' };
const frenchTranslations = { daysSuffix: 'jours' };

describe('formatDurationHours', () => {
  it('returns "0h" for zero hours', () => {
    expect(formatDurationHours(0, englishTranslations)).toBe('0h');
  });

  it('formats durations below one hour with one decimal', () => {
    expect(formatDurationHours(0.4, englishTranslations)).toBe('0.4h');
  });

  it('rounds durations up to 36 hours to a whole hour count', () => {
    expect(formatDurationHours(12.3, englishTranslations)).toBe('12h');
    expect(formatDurationHours(36, englishTranslations)).toBe('36h');
  });

  it('converts durations above 36 hours to days with one decimal and the translated suffix', () => {
    expect(formatDurationHours(72, englishTranslations)).toBe('3.0 days');
    expect(formatDurationHours(72, frenchTranslations)).toBe('3.0 jours');
  });
});
