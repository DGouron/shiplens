import { describe, expect, it } from 'vitest';
import { FailingMemberDigestGateway } from '@/modules/analytics/testing/bad-path/failing.member-digest.in-memory.gateway.ts';
import { StubMemberDigestGateway } from '@/modules/analytics/testing/good-path/stub.member-digest.in-memory.gateway.ts';
import { GenerateMemberDigestUsecase } from '@/modules/analytics/usecases/generate-member-digest.usecase.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';

describe('GenerateMemberDigestUsecase', () => {
  it('delegates to the gateway and returns the response', async () => {
    const gateway = new StubMemberDigestGateway({
      digestByMember: { Alice: '# Digest for Alice' },
    });
    const usecase = new GenerateMemberDigestUsecase(gateway);

    const result = await usecase.execute({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      memberName: 'Alice',
    });

    expect(result).toEqual({
      memberName: 'Alice',
      digest: '# Digest for Alice',
    });
    expect(gateway.generateCalls).toEqual([
      { cycleId: 'cycle-1', teamId: 'team-1', memberName: 'Alice' },
    ]);
  });

  it('propagates GatewayError from the gateway', async () => {
    const usecase = new GenerateMemberDigestUsecase(
      new FailingMemberDigestGateway(),
    );

    await expect(
      usecase.execute({
        cycleId: 'cycle-1',
        teamId: 'team-1',
        memberName: 'Alice',
      }),
    ).rejects.toBeInstanceOf(GatewayError);
  });
});
