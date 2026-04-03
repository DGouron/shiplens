import { describe, it, expect } from 'vitest';
import { BlockedIssuesPresenter } from '@modules/analytics/interface-adapters/presenters/blocked-issues.presenter.js';
import { BlockedIssueAlertBuilder } from '../../../../builders/blocked-issue-alert.builder.js';

describe('BlockedIssuesPresenter', () => {
  const presenter = new BlockedIssuesPresenter();

  it('presents an empty list', () => {
    const result = presenter.present([]);

    expect(result).toEqual([]);
  });

  it('formats alert with duration in hours', () => {
    const alert = new BlockedIssueAlertBuilder()
      .withDurationHours(50)
      .withIssueUuid('abc-123')
      .build();

    const result = presenter.present([alert]);

    expect(result).toHaveLength(1);
    expect(result[0].durationHours).toBe('2.1j');
    expect(result[0].issueUrl).toBe('https://linear.app/issue/abc-123');
    expect(result[0].severity).toBe('warning');
  });
});
