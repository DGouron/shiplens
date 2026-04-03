import { StubBlockedIssueAlertGateway } from '@modules/analytics/testing/good-path/stub.blocked-issue-alert.gateway.js';
import { GetAlertHistoryUsecase } from '@modules/analytics/usecases/get-alert-history.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { BlockedIssueAlertBuilder } from '../../../builders/blocked-issue-alert.builder.js';

describe('GetAlertHistoryUsecase', () => {
  let usecase: GetAlertHistoryUsecase;
  let alertGateway: StubBlockedIssueAlertGateway;

  beforeEach(() => {
    alertGateway = new StubBlockedIssueAlertGateway();
    usecase = new GetAlertHistoryUsecase(alertGateway);
  });

  it('returns empty list when no alerts exist', async () => {
    const result = await usecase.execute();

    expect(result).toHaveLength(0);
  });

  it('returns all alerts including resolved ones', async () => {
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

    expect(result).toHaveLength(2);
  });
});
