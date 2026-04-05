import { computeHealthSignal } from '@modules/analytics/entities/member-health/health-signal.js';
import { describe, expect, it } from 'vitest';

describe('computeHealthSignal', () => {
  it('returns not applicable when all per-cycle values are null', () => {
    const result = computeHealthSignal({
      values: [null, null, null],
      favorableDirection: 'rising',
      epsilon: { kind: 'absolute', amount: 1 },
    });

    expect(result.isApplicable).toBe(false);
  });

  it('returns not applicable when values array is empty', () => {
    const result = computeHealthSignal({
      values: [],
      favorableDirection: 'rising',
      epsilon: { kind: 'absolute', amount: 1 },
    });

    expect(result.isApplicable).toBe(false);
  });

  it('returns hasEnoughHistory false when fewer than 3 values are available', () => {
    const result = computeHealthSignal({
      values: [60, 65],
      favorableDirection: 'rising',
      epsilon: { kind: 'absolute', amount: 1 },
    });

    expect(result.isApplicable).toBe(true);
    if (!result.isApplicable) return;
    expect(result.hasEnoughHistory).toBe(false);
    expect(result.lastValue).toBe(65);
    expect(result.trend).toBeNull();
    expect(result.indicator).toBeNull();
  });

  it('returns lastValue from last non-null entry when history is insufficient', () => {
    const result = computeHealthSignal({
      values: [60, null],
      favorableDirection: 'rising',
      epsilon: { kind: 'absolute', amount: 1 },
    });

    expect(result.isApplicable).toBe(true);
    if (!result.isApplicable) return;
    expect(result.hasEnoughHistory).toBe(false);
    expect(result.lastValue).toBe(60);
  });

  it('returns green with rising trend when last run matches favorable direction', () => {
    const result = computeHealthSignal({
      values: [60, 65, 70, 75],
      favorableDirection: 'rising',
      epsilon: { kind: 'absolute', amount: 1 },
    });

    expect(result.isApplicable).toBe(true);
    if (!result.isApplicable) return;
    expect(result.hasEnoughHistory).toBe(true);
    if (!result.hasEnoughHistory) return;
    expect(result.lastValue).toBe(75);
    expect(result.trend).toBe('rising');
    expect(result.indicator).toBe('green');
  });

  it('returns red when last unfavorable run has length 2 or more', () => {
    const result = computeHealthSignal({
      values: [40, 45, 50],
      favorableDirection: 'falling',
      epsilon: { kind: 'absolute', amount: 1 },
    });

    expect(result.isApplicable).toBe(true);
    if (!result.isApplicable) return;
    expect(result.hasEnoughHistory).toBe(true);
    if (!result.hasEnoughHistory) return;
    expect(result.trend).toBe('rising');
    expect(result.indicator).toBe('red');
  });

  it('returns orange when the last unfavorable run has length 1 (first deviation)', () => {
    const result = computeHealthSignal({
      values: [60, 65, 70, 68],
      favorableDirection: 'rising',
      epsilon: { kind: 'absolute', amount: 1 },
    });

    expect(result.isApplicable).toBe(true);
    if (!result.isApplicable) return;
    expect(result.hasEnoughHistory).toBe(true);
    if (!result.hasEnoughHistory) return;
    expect(result.trend).toBe('falling');
    expect(result.indicator).toBe('orange');
  });

  it('returns orange with mixed trend when deltas alternate', () => {
    const result = computeHealthSignal({
      values: [1.5, 2.0, 1.2, 1.8],
      favorableDirection: 'falling',
      epsilon: { kind: 'absolute', amount: 0.05 },
    });

    expect(result.isApplicable).toBe(true);
    if (!result.isApplicable) return;
    expect(result.hasEnoughHistory).toBe(true);
    if (!result.hasEnoughHistory) return;
    expect(result.trend).toBe('rising');
    expect(result.indicator).toBe('orange');
  });

  it('returns stable when all deltas are within epsilon', () => {
    const result = computeHealthSignal({
      values: [70, 70.5, 70.2, 70.8],
      favorableDirection: 'rising',
      epsilon: { kind: 'absolute', amount: 1 },
    });

    expect(result.isApplicable).toBe(true);
    if (!result.isApplicable) return;
    expect(result.hasEnoughHistory).toBe(true);
    if (!result.hasEnoughHistory) return;
    expect(result.trend).toBe('stable');
    expect(result.indicator).toBe('green');
  });

  it('applies relative epsilon for durations', () => {
    const result = computeHealthSignal({
      values: [2.0, 2.05, 2.08, 2.1],
      favorableDirection: 'falling',
      epsilon: { kind: 'relative', amount: 0.05 },
    });

    expect(result.isApplicable).toBe(true);
    if (!result.isApplicable) return;
    expect(result.hasEnoughHistory).toBe(true);
    if (!result.hasEnoughHistory) return;
    expect(result.trend).toBe('stable');
    expect(result.indicator).toBe('green');
  });

  it('ignores null values when computing trend over non-null entries', () => {
    const result = computeHealthSignal({
      values: [60, null, 65, 70, 75],
      favorableDirection: 'rising',
      epsilon: { kind: 'absolute', amount: 1 },
    });

    expect(result.isApplicable).toBe(true);
    if (!result.isApplicable) return;
    expect(result.hasEnoughHistory).toBe(true);
    if (!result.hasEnoughHistory) return;
    expect(result.lastValue).toBe(75);
    expect(result.trend).toBe('rising');
    expect(result.indicator).toBe('green');
  });
});
