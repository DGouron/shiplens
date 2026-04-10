import { StubLinearWorkspaceConnectionGateway } from '@modules/identity/testing/good-path/stub.linear-workspace-connection.gateway.js';
import { StubTokenEncryptionGateway } from '@modules/identity/testing/good-path/stub.token-encryption.gateway.js';
import { StubIssueDataGateway } from '@modules/synchronization/testing/good-path/stub.issue-data.gateway.js';
import { StubLinearIssueDataGateway } from '@modules/synchronization/testing/good-path/stub.linear-issue-data.gateway.js';
import { StubSyncProgressGateway } from '@modules/synchronization/testing/good-path/stub.sync-progress.gateway.js';
import { StubTeamSelectionGateway } from '@modules/synchronization/testing/good-path/stub.team-selection.gateway.js';
import { SyncIssueDataUsecase } from '@modules/synchronization/usecases/sync-issue-data.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { LinearWorkspaceConnectionBuilder } from '../../../builders/linear-workspace-connection.builder.js';
import { TeamSelectionBuilder } from '../../../builders/team-selection.builder.js';

describe('SyncIssueDataUsecase', () => {
  let connectionGateway: StubLinearWorkspaceConnectionGateway;
  let tokenEncryptionGateway: StubTokenEncryptionGateway;
  let teamSelectionGateway: StubTeamSelectionGateway;
  let linearIssueDataGateway: StubLinearIssueDataGateway;
  let issueDataGateway: StubIssueDataGateway;
  let syncProgressGateway: StubSyncProgressGateway;
  let usecase: SyncIssueDataUsecase;

  beforeEach(() => {
    connectionGateway = new StubLinearWorkspaceConnectionGateway();
    tokenEncryptionGateway = new StubTokenEncryptionGateway();
    teamSelectionGateway = new StubTeamSelectionGateway();
    linearIssueDataGateway = new StubLinearIssueDataGateway();
    issueDataGateway = new StubIssueDataGateway();
    syncProgressGateway = new StubSyncProgressGateway();

    connectionGateway.connection =
      new LinearWorkspaceConnectionBuilder().build();
    teamSelectionGateway.selection = new TeamSelectionBuilder()
      .withSelectedTeams([{ teamId: 'team-1', teamName: 'Engineering' }])
      .withSelectedProjects([])
      .build();

    usecase = new SyncIssueDataUsecase(
      connectionGateway,
      tokenEncryptionGateway,
      teamSelectionGateway,
      linearIssueDataGateway,
      issueDataGateway,
      syncProgressGateway,
    );
  });

  it('rejects when workspace is not connected', async () => {
    connectionGateway.connection = null;

    await expect(usecase.execute({ teamId: 'team-1' })).rejects.toThrow(
      "Veuillez d'abord connecter votre workspace Linear.",
    );
  });

  it('rejects when no team is selected', async () => {
    teamSelectionGateway.selection = null;

    await expect(usecase.execute({ teamId: 'team-1' })).rejects.toThrow(
      'Veuillez sélectionner au moins une équipe avant de lancer la synchronisation.',
    );
  });

  it('imports all issues for a team across paginated pages', async () => {
    await usecase.execute({ teamId: 'team-1' });

    const storedIssues = issueDataGateway.issuesByTeamId.get('team-1');
    expect(storedIssues).toHaveLength(150);
  });

  it('imports issues with correct properties', async () => {
    await usecase.execute({ teamId: 'team-1' });

    const storedIssues = issueDataGateway.issuesByTeamId.get('team-1');
    expect(storedIssues?.[0]).toMatchObject({
      externalId: 'issue-team-1-1',
      title: 'Issue 1',
      statusName: 'Backlog',
    });
  });

  it('imports cycles for the team', async () => {
    await usecase.execute({ teamId: 'team-1' });

    const storedCycles = issueDataGateway.cyclesByTeamId.get('team-1');
    expect(storedCycles).toHaveLength(5);
  });

  it('imports state transitions for the team', async () => {
    await usecase.execute({ teamId: 'team-1' });

    const storedTransitions =
      issueDataGateway.transitionsByTeamId.get('team-1');
    expect(storedTransitions).toBeDefined();
    expect(storedTransitions?.length).toBeGreaterThanOrEqual(4);
  });

  it('saves sync progress as completed after successful sync', async () => {
    await usecase.execute({ teamId: 'team-1' });

    const progress = syncProgressGateway.progressByTeamId.get('team-1');
    expect(progress?.status).toBe('completed');
    expect(progress?.progressPercentage).toBe(100);
  });

  it('does not create duplicates on rerun', async () => {
    await usecase.execute({ teamId: 'team-1' });
    await usecase.execute({ teamId: 'team-1' });

    const storedIssues = issueDataGateway.issuesByTeamId.get('team-1');
    expect(storedIssues).toHaveLength(150);
  });

  it('handles team with no issues', async () => {
    linearIssueDataGateway.setEmptyTeam('team-1');

    await usecase.execute({ teamId: 'team-1' });

    const storedIssues = issueDataGateway.issuesByTeamId.get('team-1');
    expect(storedIssues).toHaveLength(0);

    const progress = syncProgressGateway.progressByTeamId.get('team-1');
    expect(progress?.status).toBe('completed');
  });
});
