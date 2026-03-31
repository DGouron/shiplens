import { describe, it, expect } from 'vitest';
import { StatusThreshold } from '@modules/analytics/entities/status-threshold/status-threshold.js';
import { NegativeThresholdError } from '@modules/analytics/entities/status-threshold/status-threshold.errors.js';

describe('StatusThreshold', () => {
  it('creates a status threshold with valid data', () => {
    const threshold = StatusThreshold.create({
      id: 'threshold-1',
      statusName: 'In Review',
      thresholdHours: 48,
    });

    expect(threshold.id).toBe('threshold-1');
    expect(threshold.statusName).toBe('In Review');
    expect(threshold.thresholdHours).toBe(48);
  });

  it('rejects a negative threshold', () => {
    expect(() =>
      StatusThreshold.create({
        id: 'threshold-1',
        statusName: 'In Review',
        thresholdHours: -5,
      }),
    ).toThrow(NegativeThresholdError);
  });

  it('rejects a zero threshold', () => {
    expect(() =>
      StatusThreshold.create({
        id: 'threshold-1',
        statusName: 'In Review',
        thresholdHours: 0,
      }),
    ).toThrow(NegativeThresholdError);
  });

  it('provides default thresholds for known statuses', () => {
    const defaults = StatusThreshold.defaults();

    expect(defaults).toHaveLength(3);

    const inProgress = defaults.find((d) => d.statusName === 'In Progress');
    expect(inProgress?.thresholdHours).toBe(48);

    const inReview = defaults.find((d) => d.statusName === 'In Review');
    expect(inReview?.thresholdHours).toBe(48);

    const todo = defaults.find((d) => d.statusName === 'Todo');
    expect(todo?.thresholdHours).toBe(72);
  });

  it('determines warning severity when duration exceeds threshold', () => {
    const threshold = StatusThreshold.create({
      id: 'threshold-1',
      statusName: 'In Review',
      thresholdHours: 48,
    });

    expect(threshold.computeSeverity(50)).toBe('warning');
  });

  it('determines critical severity when duration exceeds double threshold', () => {
    const threshold = StatusThreshold.create({
      id: 'threshold-1',
      statusName: 'In Review',
      thresholdHours: 48,
    });

    expect(threshold.computeSeverity(100)).toBe('critical');
  });

  it('returns null severity when duration is within threshold', () => {
    const threshold = StatusThreshold.create({
      id: 'threshold-1',
      statusName: 'In Review',
      thresholdHours: 48,
    });

    expect(threshold.computeSeverity(24)).toBeNull();
  });
});
