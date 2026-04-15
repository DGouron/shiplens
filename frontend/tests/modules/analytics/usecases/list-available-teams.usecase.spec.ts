import { describe, expect, it } from 'vitest';
import { ListAvailableTeamsUsecase } from '@/modules/analytics/usecases/list-available-teams.usecase.ts';
import { FailingSyncGateway } from '@/modules/synchronization/testing/bad-path/failing.sync.in-memory.gateway.ts';
import { StubSyncGateway } from '@/modules/synchronization/testing/good-path/stub.sync.in-memory.gateway.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { SyncAvailableTeamResponseBuilder } from '../../../builders/sync-available-team-response.builder.ts';

describe('ListAvailableTeamsUsecase', () => {
  it('returns the available teams from the sync gateway', async () => {
    const teams = [
      new SyncAvailableTeamResponseBuilder()
        .withTeamId('team-1')
        .withTeamName('Alpha')
        .build(),
      new SyncAvailableTeamResponseBuilder()
        .withTeamId('team-2')
        .withTeamName('Bravo')
        .build(),
    ];
    const usecase = new ListAvailableTeamsUsecase(
      new StubSyncGateway({ availableTeams: teams }),
    );

    const result = await usecase.execute();

    expect(result).toEqual(teams);
  });

  it('returns an empty array when the workspace has no teams', async () => {
    const usecase = new ListAvailableTeamsUsecase(
      new StubSyncGateway({ availableTeams: [] }),
    );

    const result = await usecase.execute();

    expect(result).toEqual([]);
  });

  it('propagates GatewayError from the sync gateway', async () => {
    const usecase = new ListAvailableTeamsUsecase(new FailingSyncGateway());

    await expect(usecase.execute()).rejects.toBeInstanceOf(GatewayError);
  });
});
