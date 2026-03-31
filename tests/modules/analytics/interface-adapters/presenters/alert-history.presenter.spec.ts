import { describe, it, expect } from 'vitest';
import { AlertHistoryPresenter } from '@modules/analytics/interface-adapters/presenters/alert-history.presenter.js';
import { BlockedIssueAlertBuilder } from '../../../../builders/blocked-issue-alert.builder.js';

describe('AlertHistoryPresenter', () => {
  const presenter = new AlertHistoryPresenter();

  it('presents an empty list', () => {
    const result = presenter.present([]);

    expect(result).toEqual([]);
  });

  it('includes active and resolved status', () => {
    const activeAlert = new BlockedIssueAlertBuilder()
      .withId('alert-1')
      .withActive(true)
      .build();
    const resolvedAlert = new BlockedIssueAlertBuilder()
      .withId('alert-2')
      .withActive(false)
      .withResolvedAt('2026-01-16T12:00:00Z')
      .build();

    const result = presenter.present([activeAlert, resolvedAlert]);

    expect(result).toHaveLength(2);
    expect(result[0].active).toBe(true);
    expect(result[0].resolvedAt).toBeNull();
    expect(result[1].active).toBe(false);
    expect(result[1].resolvedAt).toBe('2026-01-16T12:00:00Z');
  });

  it('formats duration in hours', () => {
    const alert = new BlockedIssueAlertBuilder().withDurationHours(72).build();

    const result = presenter.present([alert]);

    expect(result[0].durationHours).toBe('72h');
  });
});
