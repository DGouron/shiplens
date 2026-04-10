import { StubLinearWorkspaceConnectionGateway } from '@modules/identity/testing/good-path/stub.linear-workspace-connection.gateway.js';
import { StubTokenEncryptionGateway } from '@modules/identity/testing/good-path/stub.token-encryption.gateway.js';
import { StubIssueDataGateway } from '@modules/synchronization/testing/good-path/stub.issue-data.gateway.js';
import { StubLinearIssueDataGateway } from '@modules/synchronization/testing/good-path/stub.linear-issue-data.gateway.js';
import { StubSyncProgressGateway } from '@modules/synchronization/testing/good-path/stub.sync-progress.gateway.js';
import { StubTeamSelectionGateway } from '@modules/synchronization/testing/good-path/stub.team-selection.gateway.js';
import { GetSyncProgressUsecase } from '@modules/synchronization/usecases/get-sync-progress.usecase.js';
import { SyncIssueDataUsecase } from '@modules/synchronization/usecases/sync-issue-data.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { LinearWorkspaceConnectionBuilder } from '../builders/linear-workspace-connection.builder.js';
import { TeamSelectionBuilder } from '../builders/team-selection.builder.js';

describe('Sync Linear Data (acceptance)', () => {
  let connectionGateway: StubLinearWorkspaceConnectionGateway;
  let tokenEncryptionGateway: StubTokenEncryptionGateway;
  let teamSelectionGateway: StubTeamSelectionGateway;
  let linearIssueDataGateway: StubLinearIssueDataGateway;
  let issueDataGateway: StubIssueDataGateway;
  let syncProgressGateway: StubSyncProgressGateway;
  let syncUsecase: SyncIssueDataUsecase;
  let progressUsecase: GetSyncProgressUsecase;

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

    syncUsecase = new SyncIssueDataUsecase(
      connectionGateway,
      tokenEncryptionGateway,
      teamSelectionGateway,
      linearIssueDataGateway,
      issueDataGateway,
      syncProgressGateway,
    );

    progressUsecase = new GetSyncProgressUsecase(syncProgressGateway);
  });

  describe('sync imports issues with their properties', () => {
    it('import des issues: 1 team with 150 issues results in 150 issues imported with title, status, points, labels, assignee', async () => {
      await syncUsecase.execute({ teamId: 'team-1' });

      const storedIssues = issueDataGateway.issuesByTeamId.get('team-1');
      expect(storedIssues).toHaveLength(150);
      expect(storedIssues?.[0]).toHaveProperty('title');
      expect(storedIssues?.[0]).toHaveProperty('statusName');
      expect(storedIssues?.[0]).toHaveProperty('points');
      expect(storedIssues?.[0]).toHaveProperty('labelIds');
      expect(storedIssues?.[0]).toHaveProperty('assigneeName');
    });
  });

  describe('sync imports cycles with dates and linked issues', () => {
    it('import des cycles: 1 team with 5 cycles results in 5 cycles imported with dates and linked issues', async () => {
      await syncUsecase.execute({ teamId: 'team-1' });

      const storedCycles = issueDataGateway.cyclesByTeamId.get('team-1');
      expect(storedCycles).toHaveLength(5);
      expect(storedCycles?.[0]).toHaveProperty('startsAt');
      expect(storedCycles?.[0]).toHaveProperty('endsAt');
      expect(storedCycles?.[0]).toHaveProperty('issueExternalIds');
    });
  });

  describe('sync imports state transitions', () => {
    it('import des transitions: issue with 4 status changes results in 4 timestamped transitions', async () => {
      await syncUsecase.execute({ teamId: 'team-1' });

      const storedTransitions =
        issueDataGateway.transitionsByTeamId.get('team-1');
      expect(storedTransitions).toBeDefined();
      expect(storedTransitions?.length).toBeGreaterThanOrEqual(4);
      expect(storedTransitions?.[0]).toHaveProperty('fromStatusName');
      expect(storedTransitions?.[0]).toHaveProperty('toStatusName');
      expect(storedTransitions?.[0]).toHaveProperty('occurredAt');
    });
  });

  describe('sync progress is visible', () => {
    it('progression visible: after sync completes, progress shows 100%', async () => {
      await syncUsecase.execute({ teamId: 'team-1' });

      const progress = await progressUsecase.execute({ teamId: 'team-1' });
      expect(progress.progressPercentage).toBe(100);
    });
  });

  describe('sync is rerunnable without creating duplicates', () => {
    it('relance sans doublons: sync already completed then rerun produces no duplicated data', async () => {
      await syncUsecase.execute({ teamId: 'team-1' });
      await syncUsecase.execute({ teamId: 'team-1' });

      const storedIssues = issueDataGateway.issuesByTeamId.get('team-1');
      expect(storedIssues).toHaveLength(150);

      const storedCycles = issueDataGateway.cyclesByTeamId.get('team-1');
      expect(storedCycles).toHaveLength(5);
    });
  });

  describe('sync requires prerequisites', () => {
    it('aucune equipe selectionnee: rejects with error message', async () => {
      teamSelectionGateway.selection = null;

      await expect(syncUsecase.execute({ teamId: 'team-1' })).rejects.toThrow(
        'Veuillez sélectionner au moins une équipe avant de lancer la synchronisation.',
      );
    });

    it('workspace non connecte: rejects with error message', async () => {
      connectionGateway.connection = null;

      await expect(syncUsecase.execute({ teamId: 'team-1' })).rejects.toThrow(
        "Veuillez d'abord connecter votre workspace Linear.",
      );
    });
  });

  describe('sync handles team with no issues', () => {
    it('equipe sans issue: results in status synchronized with 0 issues imported', async () => {
      linearIssueDataGateway.setEmptyTeam('team-1');

      await syncUsecase.execute({ teamId: 'team-1' });

      const storedIssues = issueDataGateway.issuesByTeamId.get('team-1');
      expect(storedIssues).toHaveLength(0);

      const progress = await progressUsecase.execute({ teamId: 'team-1' });
      expect(progress.status).toBe('completed');
    });
  });
});
