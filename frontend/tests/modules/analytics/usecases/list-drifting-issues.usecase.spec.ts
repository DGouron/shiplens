import { describe, expect, it } from 'vitest';
import { FailingDriftingIssuesGateway } from '@/modules/analytics/testing/bad-path/failing.drifting-issues.in-memory.gateway.ts';
import { StubDriftingIssuesGateway } from '@/modules/analytics/testing/good-path/stub.drifting-issues.in-memory.gateway.ts';
import { ListDriftingIssuesUsecase } from '@/modules/analytics/usecases/list-drifting-issues.usecase.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { DriftingIssueResponseBuilder } from '../../../builders/drifting-issue-response.builder.ts';

describe('ListDriftingIssuesUsecase', () => {
  it('delegates to the gateway with the team identifier', async () => {
    const response = [
      new DriftingIssueResponseBuilder().withIssueExternalId('LIN-1').build(),
      new DriftingIssueResponseBuilder().withIssueExternalId('LIN-2').build(),
    ];
    const gateway = new StubDriftingIssuesGateway({ response });
    const usecase = new ListDriftingIssuesUsecase(gateway);

    const result = await usecase.execute({ teamId: 'team-1' });

    expect(result.map((issue) => issue.issueExternalId)).toEqual([
      'LIN-1',
      'LIN-2',
    ]);
    expect(gateway.calls).toEqual([{ teamId: 'team-1' }]);
  });

  it('propagates GatewayError from the gateway', async () => {
    const usecase = new ListDriftingIssuesUsecase(
      new FailingDriftingIssuesGateway(),
    );

    await expect(usecase.execute({ teamId: 'team-1' })).rejects.toBeInstanceOf(
      GatewayError,
    );
  });
});
