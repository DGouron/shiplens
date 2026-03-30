import { describe, it, expect, beforeEach } from 'vitest';
import { ListAvailableTeamsUsecase } from '@modules/synchronization/usecases/list-available-teams.usecase.js';
import { StubLinearWorkspaceConnectionGateway } from '@modules/identity/testing/good-path/stub.linear-workspace-connection.gateway.js';
import { StubTokenEncryptionGateway } from '@modules/identity/testing/good-path/stub.token-encryption.gateway.js';
import { StubLinearTeamGateway } from '@modules/synchronization/testing/good-path/stub.linear-team.gateway.js';
import { LinearWorkspaceConnectionBuilder } from '../../../builders/linear-workspace-connection.builder.js';

describe('ListAvailableTeamsUsecase', () => {
  let connectionGateway: StubLinearWorkspaceConnectionGateway;
  let tokenEncryptionGateway: StubTokenEncryptionGateway;
  let linearTeamGateway: StubLinearTeamGateway;
  let usecase: ListAvailableTeamsUsecase;

  beforeEach(() => {
    connectionGateway = new StubLinearWorkspaceConnectionGateway();
    tokenEncryptionGateway = new StubTokenEncryptionGateway();
    linearTeamGateway = new StubLinearTeamGateway();
    usecase = new ListAvailableTeamsUsecase(
      connectionGateway,
      tokenEncryptionGateway,
      linearTeamGateway,
    );
  });

  it('returns teams with projects from Linear', async () => {
    connectionGateway.connection = new LinearWorkspaceConnectionBuilder().build();

    const teams = await usecase.execute();

    expect(teams).toHaveLength(2);
    expect(teams[0].teamName).toBe('Frontend');
    expect(teams[0].projects).toHaveLength(2);
    expect(teams[1].teamName).toBe('Backend');
  });

  it('rejects when workspace is not connected', async () => {
    await expect(usecase.execute()).rejects.toThrow(
      'Veuillez d\'abord connecter votre workspace Linear.',
    );
  });

  it('rejects when no teams found in workspace', async () => {
    connectionGateway.connection = new LinearWorkspaceConnectionBuilder().build();
    linearTeamGateway.teams = [];

    await expect(usecase.execute()).rejects.toThrow(
      'Aucune équipe trouvée dans votre workspace Linear.',
    );
  });

  it('decrypts access token before calling Linear API', async () => {
    connectionGateway.connection = new LinearWorkspaceConnectionBuilder()
      .withEncryptedAccessToken('encrypted:my-token')
      .build();

    await usecase.execute();

    expect(linearTeamGateway.lastUsedToken).toBe('my-token');
  });
});
