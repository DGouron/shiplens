import { describe, it, expect, beforeEach } from 'vitest';
import { SaveTeamSelectionUsecase } from '@modules/synchronization/usecases/save-team-selection.usecase.js';
import { StubLinearWorkspaceConnectionGateway } from '@modules/identity/testing/good-path/stub.linear-workspace-connection.gateway.js';
import { StubTokenEncryptionGateway } from '@modules/identity/testing/good-path/stub.token-encryption.gateway.js';
import { StubTeamSelectionGateway } from '@modules/synchronization/testing/good-path/stub.team-selection.gateway.js';
import { StubLinearTeamGateway } from '@modules/synchronization/testing/good-path/stub.linear-team.gateway.js';
import { LinearWorkspaceConnectionBuilder } from '../../../builders/linear-workspace-connection.builder.js';

describe('SaveTeamSelectionUsecase', () => {
  let connectionGateway: StubLinearWorkspaceConnectionGateway;
  let tokenEncryptionGateway: StubTokenEncryptionGateway;
  let teamSelectionGateway: StubTeamSelectionGateway;
  let linearTeamGateway: StubLinearTeamGateway;
  let usecase: SaveTeamSelectionUsecase;

  beforeEach(() => {
    connectionGateway = new StubLinearWorkspaceConnectionGateway();
    tokenEncryptionGateway = new StubTokenEncryptionGateway();
    teamSelectionGateway = new StubTeamSelectionGateway();
    linearTeamGateway = new StubLinearTeamGateway();
    connectionGateway.connection = new LinearWorkspaceConnectionBuilder().build();

    usecase = new SaveTeamSelectionUsecase(
      connectionGateway,
      tokenEncryptionGateway,
      teamSelectionGateway,
      linearTeamGateway,
    );
  });

  it('saves selection and returns issue count estimate', async () => {
    const result = await usecase.execute({
      selectedTeams: [
        { teamId: 'team-1', teamName: 'Frontend' },
        { teamId: 'team-2', teamName: 'Backend' },
      ],
      selectedProjects: [
        { projectId: 'proj-1', projectName: 'v2 Launch', teamId: 'team-1' },
      ],
    });

    expect(teamSelectionGateway.selection).not.toBeNull();
    expect(teamSelectionGateway.selection?.selectedTeams).toHaveLength(2);
    expect(result.estimatedIssueCount).toBe(150);
  });

  it('rejects when no teams are selected', async () => {
    await expect(
      usecase.execute({
        selectedTeams: [],
        selectedProjects: [],
      }),
    ).rejects.toThrow('Veuillez sélectionner au moins une équipe.');
  });

  it('rejects when workspace is not connected', async () => {
    connectionGateway.connection = null;

    await expect(
      usecase.execute({
        selectedTeams: [{ teamId: 'team-1', teamName: 'Frontend' }],
        selectedProjects: [],
      }),
    ).rejects.toThrow('Veuillez d\'abord connecter votre workspace Linear.');
  });

  it('replaces existing selection on modification', async () => {
    await usecase.execute({
      selectedTeams: [{ teamId: 'team-1', teamName: 'Frontend' }],
      selectedProjects: [],
    });

    await usecase.execute({
      selectedTeams: [{ teamId: 'team-2', teamName: 'Backend' }],
      selectedProjects: [
        { projectId: 'proj-3', projectName: 'API v3', teamId: 'team-2' },
      ],
    });

    expect(teamSelectionGateway.selection?.selectedTeams).toHaveLength(1);
    expect(teamSelectionGateway.selection?.selectedTeams[0].teamId).toBe('team-2');
  });
});
