import { BlockedIssueAlert } from '@modules/analytics/entities/blocked-issue-alert/blocked-issue-alert.js';
import { describe, expect, it } from 'vitest';

describe('BlockedIssueAlert', () => {
  it('creates an active alert with warning severity', () => {
    const alert = BlockedIssueAlert.create({
      id: 'alert-1',
      issueExternalId: 'issue-1',
      issueTitle: 'Fix login bug',
      issueUuid: 'uuid-1',
      teamId: 'team-1',
      statusName: 'In Review',
      severity: 'warning',
      durationHours: 50,
      detectedAt: '2026-01-15T12:00:00Z',
      active: true,
      resolvedAt: null,
      assigneeName: null,
    });

    expect(alert.id).toBe('alert-1');
    expect(alert.issueExternalId).toBe('issue-1');
    expect(alert.issueTitle).toBe('Fix login bug');
    expect(alert.severity).toBe('warning');
    expect(alert.durationHours).toBe(50);
    expect(alert.active).toBe(true);
    expect(alert.resolvedAt).toBeNull();
  });

  it('creates an alert with critical severity', () => {
    const alert = BlockedIssueAlert.create({
      id: 'alert-1',
      issueExternalId: 'issue-1',
      issueTitle: 'Fix login bug',
      issueUuid: 'uuid-1',
      teamId: 'team-1',
      statusName: 'In Review',
      severity: 'critical',
      durationHours: 100,
      detectedAt: '2026-01-15T12:00:00Z',
      active: true,
      resolvedAt: null,
      assigneeName: null,
    });

    expect(alert.severity).toBe('critical');
    expect(alert.durationHours).toBe(100);
  });

  it('generates the Linear issue URL from uuid', () => {
    const alert = BlockedIssueAlert.create({
      id: 'alert-1',
      issueExternalId: 'issue-1',
      issueTitle: 'Fix login bug',
      issueUuid: 'abc-123-def',
      teamId: 'team-1',
      statusName: 'In Review',
      severity: 'warning',
      durationHours: 50,
      detectedAt: '2026-01-15T12:00:00Z',
      active: true,
      resolvedAt: null,
      assigneeName: null,
    });

    expect(alert.issueUrl).toBe('https://linear.app/issue/abc-123-def');
  });

  it('resolves an active alert', () => {
    const alert = BlockedIssueAlert.create({
      id: 'alert-1',
      issueExternalId: 'issue-1',
      issueTitle: 'Fix login bug',
      issueUuid: 'uuid-1',
      teamId: 'team-1',
      statusName: 'In Review',
      severity: 'warning',
      durationHours: 50,
      detectedAt: '2026-01-15T12:00:00Z',
      active: true,
      resolvedAt: null,
      assigneeName: null,
    });

    const resolved = alert.resolve('2026-01-16T12:00:00Z');

    expect(resolved.active).toBe(false);
    expect(resolved.resolvedAt).toBe('2026-01-16T12:00:00Z');
    expect(alert.active).toBe(true);
  });
});
