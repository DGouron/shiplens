import { describe, expect, it } from 'vitest';
import { FailingMemberHealthGateway } from '@/modules/analytics/testing/bad-path/failing.member-health.in-memory.gateway.ts';
import { StubMemberHealthGateway } from '@/modules/analytics/testing/good-path/stub.member-health.in-memory.gateway.ts';
import { GetMemberHealthUsecase } from '@/modules/analytics/usecases/get-member-health.usecase.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { MemberHealthResponseBuilder } from '../../../builders/member-health-response.builder.ts';

describe('GetMemberHealthUsecase', () => {
  it('delegates to the gateway and returns the response', async () => {
    const response = new MemberHealthResponseBuilder()
      .withMemberName('Alice')
      .build();
    const gateway = new StubMemberHealthGateway({ response });
    const usecase = new GetMemberHealthUsecase(gateway);

    const result = await usecase.execute({
      teamId: 'team-1',
      memberName: 'Alice',
      cycles: 5,
    });

    expect(result).toEqual(response);
    expect(gateway.calls).toEqual([
      { teamId: 'team-1', memberName: 'Alice', cycles: 5 },
    ]);
  });

  it('returns null when the gateway returns null', async () => {
    const gateway = new StubMemberHealthGateway({ response: null });
    const usecase = new GetMemberHealthUsecase(gateway);

    const result = await usecase.execute({
      teamId: 'team-1',
      memberName: 'Bob',
      cycles: 5,
    });

    expect(result).toBeNull();
  });

  it('propagates GatewayError from the gateway', async () => {
    const usecase = new GetMemberHealthUsecase(
      new FailingMemberHealthGateway(),
    );

    await expect(
      usecase.execute({ teamId: 'team-1', memberName: 'Alice', cycles: 5 }),
    ).rejects.toBeInstanceOf(GatewayError);
  });
});
