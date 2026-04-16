import { BlockedIssuesPresenter } from '@modules/analytics/interface-adapters/presenters/blocked-issues.presenter.js';
import { describe, expect, it } from 'vitest';
import { BlockedIssueAlertBuilder } from '../../../../builders/blocked-issue-alert.builder.js';

describe('BlockedIssuesPresenter', () => {
  const presenter = new BlockedIssuesPresenter();

  it('presents an empty list', () => {
    const result = presenter.present([]);

    expect(result).toEqual([]);
  });

  it('presents alert duration as raw numeric hours', () => {
    const alert = new BlockedIssueAlertBuilder()
      .withDurationHours(50)
      .withIssueUuid('abc-123')
      .build();

    const result = presenter.present([alert]);

    expect(result).toHaveLength(1);
    expect(result[0].durationHours).toBe(50);
    expect(result[0].issueUrl).toBe('https://linear.app/issue/abc-123');
    expect(result[0].severity).toBe('warning');
  });

  it('presents the assignee name when the alert carries one', () => {
    const alert = new BlockedIssueAlertBuilder()
      .withAssigneeName('Alice Martin')
      .build();

    const result = presenter.present([alert]);

    expect(result[0].assigneeName).toBe('Alice Martin');
  });

  it('presents a null assignee name when the alert has no assignee', () => {
    const alert = new BlockedIssueAlertBuilder().build();

    const result = presenter.present([alert]);

    expect(result[0].assigneeName).toBeNull();
  });
});
