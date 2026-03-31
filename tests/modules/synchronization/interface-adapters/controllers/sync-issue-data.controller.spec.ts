import { describe, it, expect, beforeEach } from 'vitest';
import { SyncIssueDataController } from '@modules/synchronization/interface-adapters/controllers/sync-issue-data.controller.js';
import { SyncIssueDataUsecase } from '@modules/synchronization/usecases/sync-issue-data.usecase.js';
import { GetSyncProgressUsecase } from '@modules/synchronization/usecases/get-sync-progress.usecase.js';
import { SyncProgressPresenter } from '@modules/synchronization/interface-adapters/presenters/sync-progress.presenter.js';
import { StubLinearWorkspaceConnectionGateway } from '@modules/identity/testing/good-path/stub.linear-workspace-connection.gateway.js';
import { StubTokenEncryptionGateway } from '@modules/identity/testing/good-path/stub.token-encryption.gateway.js';
import { StubTeamSelectionGateway } from '@modules/synchronization/testing/good-path/stub.team-selection.gateway.js';
import { StubLinearIssueDataGateway } from '@modules/synchronization/testing/good-path/stub.linear-issue-data.gateway.js';
import { StubIssueDataGateway } from '@modules/synchronization/testing/good-path/stub.issue-data.gateway.js';
import { StubSyncProgressGateway } from '@modules/synchronization/testing/good-path/stub.sync-progress.gateway.js';
import { LinearWorkspaceConnectionBuilder } from '../../../../builders/linear-workspace-connection.builder.js';
import { TeamSelectionBuilder } from '../../../../builders/team-selection.builder.js';

describe('SyncIssueDataController', () => {
  let controller: SyncIssueDataController;
  let syncProgressGateway: StubSyncProgressGateway;

  beforeEach(() => {
    const connectionGateway = new StubLinearWorkspaceConnectionGateway();
    const tokenEncryptionGateway = new StubTokenEncryptionGateway();
    const teamSelectionGateway = new StubTeamSelectionGateway();
    const linearIssueDataGateway = new StubLinearIssueDataGateway();
    const issueDataGateway = new StubIssueDataGateway();
    syncProgressGateway = new StubSyncProgressGateway();

    connectionGateway.connection =
      new LinearWorkspaceConnectionBuilder().build();
    teamSelectionGateway.selection = new TeamSelectionBuilder()
      .withSelectedTeams([{ teamId: 'team-1', teamName: 'Engineering' }])
      .withSelectedProjects([])
      .build();

    const syncIssueDataUsecase = new SyncIssueDataUsecase(
      connectionGateway,
      tokenEncryptionGateway,
      teamSelectionGateway,
      linearIssueDataGateway,
      issueDataGateway,
      syncProgressGateway,
    );

    const getSyncProgressUsecase = new GetSyncProgressUsecase(
      syncProgressGateway,
    );

    const presenter = new SyncProgressPresenter();

    controller = new SyncIssueDataController(
      syncIssueDataUsecase,
      getSyncProgressUsecase,
      presenter,
    );
  });

  it('syncs issue data for a team', async () => {
    await controller.syncIssueData({ teamId: 'team-1' });

    const progress = await syncProgressGateway.getByTeamId('team-1');
    expect(progress?.status).toBe('completed');
  });

  it('returns sync progress for a team', async () => {
    await controller.syncIssueData({ teamId: 'team-1' });

    const result = await controller.getSyncProgress({ teamId: 'team-1' });

    expect(result).toEqual({
      teamId: 'team-1',
      progressPercentage: 100,
      status: 'completed',
    });
  });

  it('returns not started progress for unknown team', async () => {
    const result = await controller.getSyncProgress({ teamId: 'unknown' });

    expect(result).toEqual({
      teamId: 'unknown',
      progressPercentage: 0,
      status: 'not_started',
    });
  });
});
