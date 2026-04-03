import { StubLinearWorkspaceConnectionGateway } from '@modules/identity/testing/good-path/stub.linear-workspace-connection.gateway.js';
import { StubTokenEncryptionGateway } from '@modules/identity/testing/good-path/stub.token-encryption.gateway.js';
import { StubLinearReferenceDataGateway } from '@modules/synchronization/testing/good-path/stub.linear-reference-data.gateway.js';
import { StubReferenceDataGateway } from '@modules/synchronization/testing/good-path/stub.reference-data.gateway.js';
import { StubTeamSelectionGateway } from '@modules/synchronization/testing/good-path/stub.team-selection.gateway.js';
import { SyncReferenceDataUsecase } from '@modules/synchronization/usecases/sync-reference-data.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { LinearWorkspaceConnectionBuilder } from '../../../builders/linear-workspace-connection.builder.js';
import { TeamSelectionBuilder } from '../../../builders/team-selection.builder.js';

describe('SyncReferenceDataUsecase', () => {
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

  it('rejects when workspace is not connected', async () => {
    connectionGateway.connection = null;

    await expect(usecase.execute()).rejects.toThrow(
      "Veuillez d'abord connecter votre workspace Linear.",
    );
  });

  it('rejects when no team is selected', async () => {
    teamSelectionGateway.selection = null;

    await expect(usecase.execute()).rejects.toThrow(
      'Veuillez sélectionner au moins une équipe avant de lancer la synchronisation.',
    );
  });

  it('imports labels for selected team', async () => {
    await usecase.execute();

    const stored = referenceDataGateway.dataByTeamId.get('team-1');
    expect(stored?.labels).toHaveLength(8);
    expect(stored?.labels[0]).toMatchObject({ name: 'Bug', color: '#ef4444' });
  });

  it('imports workflow statuses in order', async () => {
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

  it('imports team members with roles', async () => {
    await usecase.execute();

    const stored = referenceDataGateway.dataByTeamId.get('team-1');
    expect(stored?.teamMembers).toHaveLength(6);
    expect(stored?.teamMembers[0]).toMatchObject({
      name: 'Alice Martin',
      role: 'admin',
    });
  });

  it('imports projects with milestones', async () => {
    await usecase.execute();

    const stored = referenceDataGateway.dataByTeamId.get('team-1');
    expect(stored?.projects).toHaveLength(3);
    const projectWithMilestones = stored?.projects.find(
      (project) => project.milestones.length > 0,
    );
    expect(projectWithMilestones?.milestones).toHaveLength(2);
  });

  it('updates data when labels are renamed', async () => {
    await usecase.execute();

    linearReferenceDataGateway.renameFirstLabel('team-1', 'Renamed Label');

    await usecase.execute();

    const stored = referenceDataGateway.dataByTeamId.get('team-1');
    expect(stored?.labels[0].name).toBe('Renamed Label');
  });

  it('does not create duplicates on rerun', async () => {
    await usecase.execute();
    await usecase.execute();

    const stored = referenceDataGateway.dataByTeamId.get('team-1');
    expect(stored?.labels).toHaveLength(8);
    expect(stored?.workflowStatuses).toHaveLength(5);
    expect(stored?.teamMembers).toHaveLength(6);
    expect(stored?.projects).toHaveLength(3);
  });

  it('returns synced team count', async () => {
    const result = await usecase.execute();

    expect(result.syncedTeamCount).toBe(1);
  });

  it('syncs multiple teams', async () => {
    teamSelectionGateway.selection = new TeamSelectionBuilder()
      .withSelectedTeams([
        { teamId: 'team-1', teamName: 'Engineering' },
        { teamId: 'team-2', teamName: 'Design' },
      ])
      .withSelectedProjects([])
      .build();

    const result = await usecase.execute();

    expect(result.syncedTeamCount).toBe(2);
    expect(referenceDataGateway.dataByTeamId.has('team-1')).toBe(true);
    expect(referenceDataGateway.dataByTeamId.has('team-2')).toBe(true);
  });
});
