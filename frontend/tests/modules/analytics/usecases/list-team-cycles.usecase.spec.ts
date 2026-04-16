import { describe, expect, it } from 'vitest';
import { FailingTeamCyclesGateway } from '@/modules/analytics/testing/bad-path/failing.team-cycles.in-memory.gateway.ts';
import { StubEmptyTeamCyclesGateway } from '@/modules/analytics/testing/good-path/stub.empty-team-cycles.in-memory.gateway.ts';
import { StubTeamCyclesGateway } from '@/modules/analytics/testing/good-path/stub.team-cycles.in-memory.gateway.ts';
import { ListTeamCyclesUsecase } from '@/modules/analytics/usecases/list-team-cycles.usecase.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { TeamCyclesResponseBuilder } from '../../../builders/team-cycles-response.builder.ts';

describe('ListTeamCyclesUsecase', () => {
  it('delegates to the gateway with the given teamId and returns the response', async () => {
    const response = new TeamCyclesResponseBuilder().build();
    const gateway = new StubTeamCyclesGateway({ response });
    const usecase = new ListTeamCyclesUsecase(gateway);

    const result = await usecase.execute({ teamId: 'team-42' });

    expect(result).toEqual(response);
    expect(gateway.calls).toEqual(['team-42']);
  });

  it('returns an empty cycles array when the team has no cycles', async () => {
    const usecase = new ListTeamCyclesUsecase(new StubEmptyTeamCyclesGateway());

    const result = await usecase.execute({ teamId: 'team-1' });

    expect(result).toEqual({ cycles: [] });
  });

  it('propagates GatewayError from the gateway', async () => {
    const usecase = new ListTeamCyclesUsecase(new FailingTeamCyclesGateway());

    await expect(usecase.execute({ teamId: 'team-1' })).rejects.toBeInstanceOf(
      GatewayError,
    );
  });
});
