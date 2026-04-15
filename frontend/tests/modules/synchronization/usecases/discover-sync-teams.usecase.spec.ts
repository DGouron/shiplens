import { describe, expect, it } from 'vitest';
import { StubSyncGateway } from '@/modules/synchronization/testing/good-path/stub.sync.in-memory.gateway.ts';
import { NoTeamsAvailableInWorkspace } from '@/modules/synchronization/usecases/discover-sync-teams.usecase.errors.ts';
import { DiscoverSyncTeamsUsecase } from '@/modules/synchronization/usecases/discover-sync-teams.usecase.ts';
import { SyncAvailableTeamResponseBuilder } from '../../../builders/sync-available-team-response.builder.ts';

describe('DiscoverSyncTeamsUsecase', () => {
  it('returns the available teams from the gateway', async () => {
    const availableTeams = [
      new SyncAvailableTeamResponseBuilder().withTeamId('team-1').build(),
      new SyncAvailableTeamResponseBuilder().withTeamId('team-2').build(),
    ];
    const usecase = new DiscoverSyncTeamsUsecase(
      new StubSyncGateway({ availableTeams }),
    );

    const result = await usecase.execute();

    expect(result).toEqual(availableTeams);
  });

  it('throws NoTeamsAvailableInWorkspace when the gateway returns an empty array', async () => {
    const usecase = new DiscoverSyncTeamsUsecase(
      new StubSyncGateway({ availableTeams: [] }),
    );

    await expect(usecase.execute()).rejects.toBeInstanceOf(
      NoTeamsAvailableInWorkspace,
    );
  });
});
