import { StubSyncProgressGateway } from '@modules/synchronization/testing/good-path/stub.sync-progress.gateway.js';
import { GetSyncProgressUsecase } from '@modules/synchronization/usecases/get-sync-progress.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { SyncProgressBuilder } from '../../../builders/sync-progress.builder.js';

describe('GetSyncProgressUsecase', () => {
  let syncProgressGateway: StubSyncProgressGateway;
  let usecase: GetSyncProgressUsecase;

  beforeEach(() => {
    syncProgressGateway = new StubSyncProgressGateway();
    usecase = new GetSyncProgressUsecase(syncProgressGateway);
  });

  it('returns progress for a given team', async () => {
    const progress = new SyncProgressBuilder()
      .withTeamId('team-1')
      .withTotalIssues(150)
      .withSyncedIssues(75)
      .withStatus('in_progress')
      .build();
    syncProgressGateway.progressByTeamId.set('team-1', progress);

    const result = await usecase.execute({ teamId: 'team-1' });

    expect(result.teamId).toBe('team-1');
    expect(result.progressPercentage).toBe(50);
    expect(result.status).toBe('in_progress');
  });

  it('returns completed progress with 100%', async () => {
    const progress = new SyncProgressBuilder()
      .withTeamId('team-1')
      .withTotalIssues(150)
      .withSyncedIssues(150)
      .withStatus('completed')
      .build();
    syncProgressGateway.progressByTeamId.set('team-1', progress);

    const result = await usecase.execute({ teamId: 'team-1' });

    expect(result.progressPercentage).toBe(100);
    expect(result.status).toBe('completed');
  });

  it('returns default progress when no sync has been started', async () => {
    const result = await usecase.execute({ teamId: 'team-1' });

    expect(result.teamId).toBe('team-1');
    expect(result.progressPercentage).toBe(0);
    expect(result.status).toBe('not_started');
  });
});
