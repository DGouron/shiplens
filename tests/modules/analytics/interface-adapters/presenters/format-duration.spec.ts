import { describe, it, expect } from 'vitest';
import { formatDuration } from '@modules/analytics/interface-adapters/presenters/format-duration.js';

describe('formatDuration', () => {
  it('formats zero hours', () => {
    expect(formatDuration(0)).toBe('0h');
  });

  it('formats sub-hour values with one decimal', () => {
    expect(formatDuration(0.492)).toBe('0.5h');
    expect(formatDuration(0.064)).toBe('0.1h');
    expect(formatDuration(0.183)).toBe('0.2h');
  });

  it('rounds values between 1h and 36h to integer', () => {
    expect(formatDuration(4.147)).toBe('4h');
    expect(formatDuration(24)).toBe('24h');
    expect(formatDuration(12.766)).toBe('13h');
    expect(formatDuration(1.347)).toBe('1h');
  });

  it('keeps 36h as hours', () => {
    expect(formatDuration(36)).toBe('36h');
  });

  it('converts values above 36h to days with one decimal', () => {
    expect(formatDuration(72.078)).toBe('3.0j');
    expect(formatDuration(287.181)).toBe('12.0j');
    expect(formatDuration(1353.335)).toBe('56.4j');
    expect(formatDuration(51.315)).toBe('2.1j');
  });

  it('handles 48h as 2 days', () => {
    expect(formatDuration(48)).toBe('2.0j');
  });
});
