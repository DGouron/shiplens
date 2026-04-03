import { StubBlockedIssueAlertGateway } from '@modules/analytics/testing/good-path/stub.blocked-issue-alert.gateway.js';
import { GetBlockedIssuesUsecase } from '@modules/analytics/usecases/get-blocked-issues.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { BlockedIssueAlertBuilder } from '../../../builders/blocked-issue-alert.builder.js';

describe('GetBlockedIssuesUsecase', () => {
  let usecase: GetBlockedIssuesUsecase;
  let alertGateway: StubBlockedIssueAlertGateway;

  beforeEach(() => {
    alertGateway = new StubBlockedIssueAlertGateway();
    usecase = new GetBlockedIssuesUsecase(alertGateway);
  });

  it('returns empty list when no active alerts', async () => {
    const result = await usecase.execute();

    expect(result).toHaveLength(0);
  });

  it('returns only active alerts', async () => {
    const activeAlert = new BlockedIssueAlertBuilder()
      .withId('alert-1')
      .withActive(true)
      .build();
    const resolvedAlert = new BlockedIssueAlertBuilder()
      .withId('alert-2')
      .withActive(false)
      .withResolvedAt('2026-01-16T12:00:00Z')
      .build();
    alertGateway.alerts = [activeAlert, resolvedAlert];

    const result = await usecase.execute();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('alert-1');
  });

  it('sorts alerts with critical first then by duration descending', async () => {
    const warning1 = new BlockedIssueAlertBuilder()
      .withId('alert-1')
      .withSeverity('warning')
      .withDurationHours(60)
      .withIssueExternalId('issue-1')
      .build();
    const critical = new BlockedIssueAlertBuilder()
      .withId('alert-2')
      .withSeverity('critical')
      .withDurationHours(100)
      .withIssueExternalId('issue-2')
      .build();
    const warning2 = new BlockedIssueAlertBuilder()
      .withId('alert-3')
      .withSeverity('warning')
      .withDurationHours(50)
      .withIssueExternalId('issue-3')
      .build();
    alertGateway.alerts = [warning1, critical, warning2];

    const result = await usecase.execute();

    expect(result[0].severity).toBe('critical');
    expect(result[1].severity).toBe('warning');
    expect(result[1].durationHours).toBe(60);
    expect(result[2].severity).toBe('warning');
    expect(result[2].durationHours).toBe(50);
  });
});
