import { describe, expect, it } from 'vitest';
import { FailingBlockedIssuesGateway } from '@/modules/analytics/testing/bad-path/failing.blocked-issues.in-memory.gateway.ts';
import { StubBlockedIssuesGateway } from '@/modules/analytics/testing/good-path/stub.blocked-issues.in-memory.gateway.ts';
import { ListBlockedIssuesUsecase } from '@/modules/analytics/usecases/list-blocked-issues.usecase.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { BlockedIssueAlertResponseBuilder } from '../../../builders/blocked-issue-alert-response.builder.ts';

describe('ListBlockedIssuesUsecase', () => {
  it('delegates to the gateway and returns the full workspace list', async () => {
    const response = [
      new BlockedIssueAlertResponseBuilder().withId('alert-1').build(),
      new BlockedIssueAlertResponseBuilder().withId('alert-2').build(),
    ];
    const gateway = new StubBlockedIssuesGateway({ response });
    const usecase = new ListBlockedIssuesUsecase(gateway);

    const result = await usecase.execute();

    expect(result.map((alert) => alert.id)).toEqual(['alert-1', 'alert-2']);
    expect(gateway.callCount).toBe(1);
  });

  it('propagates GatewayError from the gateway', async () => {
    const usecase = new ListBlockedIssuesUsecase(
      new FailingBlockedIssuesGateway(),
    );

    await expect(usecase.execute()).rejects.toBeInstanceOf(GatewayError);
  });
});
