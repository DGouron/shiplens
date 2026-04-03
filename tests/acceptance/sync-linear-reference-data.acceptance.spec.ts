import { StubLinearWorkspaceConnectionGateway } from '@modules/identity/testing/good-path/stub.linear-workspace-connection.gateway.js';
import { StubTokenEncryptionGateway } from '@modules/identity/testing/good-path/stub.token-encryption.gateway.js';
import { StubLinearReferenceDataGateway } from '@modules/synchronization/testing/good-path/stub.linear-reference-data.gateway.js';
import { StubReferenceDataGateway } from '@modules/synchronization/testing/good-path/stub.reference-data.gateway.js';
import { StubTeamSelectionGateway } from '@modules/synchronization/testing/good-path/stub.team-selection.gateway.js';
import { SyncReferenceDataUsecase } from '@modules/synchronization/usecases/sync-reference-data.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { LinearWorkspaceConnectionBuilder } from '../builders/linear-workspace-connection.builder.js';
import { TeamSelectionBuilder } from '../builders/team-selection.builder.js';

describe('Sync Linear Reference Data (acceptance)', () => {
  let connectionGateway: StubLinearWorkspaceConnectionGateway;
  let tokenEncryptionGateway: StubTokenEncryptionGateway;
  let teamSelectionGateway: StubTeamSelectionGateway;
  let linearReferenceDataGateway: StubLinearReferenceDataGateway;
  let referenceDataGateway: StubReferenceDataGateway;
  let usecase: SyncReferenceDataUsecase;

  beforeEach(() => {
    connectionGateway = new StubLinearWorkspaceConnectionGateway();
    tokenEncryptionGateway = new StubTokenEncryptionGateway();
    teamSelectionGateway = new StubTeamSelectionGateway();
    linearReferenceDataGateway = new StubLinearReferenceDataGateway();
    referenceDataGateway = new StubReferenceDataGateway();

    connectionGateway.connection =
      new LinearWorkspaceConnectionBuilder().build();
    teamSelectionGateway.selection = new TeamSelectionBuilder()
      .withSelectedTeams([{ teamId: 'team-1', teamName: 'Engineering' }])
      .withSelectedProjects([])
      .build();

    usecase = new SyncReferenceDataUsecase(
      connectionGateway,
      tokenEncryptionGateway,
      teamSelectionGateway,
      linearReferenceDataGateway,
      referenceDataGateway,
    );
  });

  describe('only reference data from selected teams are imported', () => {
    it('imports labels: team with 8 labels results in 8 labels imported with name and color', async () => {
      await usecase.execute();

      const stored = referenceDataGateway.dataByTeamId.get('team-1');
      expect(stored?.labels).toHaveLength(8);
      expect(stored?.labels[0]).toHaveProperty('name');
      expect(stored?.labels[0]).toHaveProperty('color');
    });

    it('imports workflow statuses: team with 5 statuses results in 5 statuses imported in workflow order', async () => {
      await usecase.execute();

      const stored = referenceDataGateway.dataByTeamId.get('team-1');
      expect(stored?.workflowStatuses).toHaveLength(5);
      const names = stored?.workflowStatuses.map((status) => status.name);
      expect(names).toEqual([
        'Backlog',
        'Todo',
        'In Progress',
        'In Review',
        'Done',
      ]);
    });

    it('imports members: team with 6 members results in 6 members imported with name and role', async () => {
      await usecase.execute();

      const stored = referenceDataGateway.dataByTeamId.get('team-1');
      expect(stored?.teamMembers).toHaveLength(6);
      expect(stored?.teamMembers[0]).toHaveProperty('name');
      expect(stored?.teamMembers[0]).toHaveProperty('role');
    });

    it('imports projects: team with 3 projects including 1 with 2 milestones', async () => {
      await usecase.execute();

      const stored = referenceDataGateway.dataByTeamId.get('team-1');
      expect(stored?.projects).toHaveLength(3);
      const projectWithMilestones = stored?.projects.find(
        (project) => project.milestones.length > 0,
      );
      expect(projectWithMilestones?.milestones).toHaveLength(2);
    });
  });

  describe('sync is rerunnable without creating duplicates', () => {
    it('update after modification: renamed label is updated in Shiplens', async () => {
      await usecase.execute();

      linearReferenceDataGateway.renameFirstLabel('team-1', 'Renamed Label');

      await usecase.execute();

      const stored = referenceDataGateway.dataByTeamId.get('team-1');
      expect(stored?.labels[0].name).toBe('Renamed Label');
    });

    it('rerun without duplicates: sync already completed then rerun produces no duplicated data', async () => {
      await usecase.execute();
      await usecase.execute();

      const stored = referenceDataGateway.dataByTeamId.get('team-1');
      expect(stored?.labels).toHaveLength(8);
      expect(stored?.workflowStatuses).toHaveLength(5);
      expect(stored?.teamMembers).toHaveLength(6);
      expect(stored?.projects).toHaveLength(3);
    });
  });

  describe('sync requires prerequisites', () => {
    it('no team selected: rejects with error message', async () => {
      teamSelectionGateway.selection = null;

      await expect(usecase.execute()).rejects.toThrow(
        'Veuillez sélectionner au moins une équipe avant de lancer la synchronisation.',
      );
    });

    it('workspace not connected: rejects with error message', async () => {
      connectionGateway.connection = null;

      await expect(usecase.execute()).rejects.toThrow(
        "Veuillez d'abord connecter votre workspace Linear.",
      );
    });
  });
});
