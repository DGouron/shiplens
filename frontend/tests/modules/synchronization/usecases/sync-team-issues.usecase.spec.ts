import { describe, expect, it } from 'vitest';
import { StubSyncGateway } from '@/modules/synchronization/testing/good-path/stub.sync.in-memory.gateway.ts';
import { SyncTeamIssuesUsecase } from '@/modules/synchronization/usecases/sync-team-issues.usecase.ts';

describe('SyncTeamIssuesUsecase', () => {
  it('delegates to the gateway with the given teamId', async () => {
    const gateway = new StubSyncGateway();
    const usecase = new SyncTeamIssuesUsecase(gateway);

    await usecase.execute({ teamId: 'team-42' });

    expect(gateway.teamIssuesSyncedFor).toEqual(['team-42']);
  });
});
