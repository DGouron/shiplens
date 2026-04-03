import { FailingLinearApiGateway } from '@modules/identity/testing/bad-path/failing.linear-api.gateway.js';
import { StubLinearApiGateway } from '@modules/identity/testing/good-path/stub.linear-api.gateway.js';
import { StubLinearWorkspaceConnectionGateway } from '@modules/identity/testing/good-path/stub.linear-workspace-connection.gateway.js';
import { StubTokenEncryptionGateway } from '@modules/identity/testing/good-path/stub.token-encryption.gateway.js';
import { ConnectLinearWorkspaceUsecase } from '@modules/identity/usecases/connect-linear-workspace.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { LinearWorkspaceConnectionBuilder } from '../../../builders/linear-workspace-connection.builder.js';

describe('ConnectLinearWorkspaceUsecase', () => {
  let connectionGateway: StubLinearWorkspaceConnectionGateway;
  let linearApiGateway: StubLinearApiGateway;
  let tokenEncryptionGateway: StubTokenEncryptionGateway;
  let usecase: ConnectLinearWorkspaceUsecase;

  beforeEach(() => {
    connectionGateway = new StubLinearWorkspaceConnectionGateway();
    linearApiGateway = new StubLinearApiGateway();
    tokenEncryptionGateway = new StubTokenEncryptionGateway();
    usecase = new ConnectLinearWorkspaceUsecase(
      connectionGateway,
      linearApiGateway,
      tokenEncryptionGateway,
    );
  });

  it('exchanges code and creates a connected workspace', async () => {
    await usecase.execute({
      code: 'valid-code',
      redirectUri: 'http://localhost:3000/callback',
    });

    const saved = await connectionGateway.get();
    expect(saved).not.toBeNull();
    expect(saved?.status).toBe('connected');
    expect(saved?.workspaceName).toBe('My Workspace');
    expect(saved?.workspaceId).toBe('workspace-123');
  });

  it('encrypts tokens before saving', async () => {
    await usecase.execute({
      code: 'valid-code',
      redirectUri: 'http://localhost:3000/callback',
    });

    const saved = await connectionGateway.get();
    expect(saved?.encryptedAccessToken).toBe('encrypted:test-access-token');
    expect(saved?.encryptedRefreshToken).toBe('encrypted:test-refresh-token');
  });

  it('replaces existing connection when workspace already connected', async () => {
    const existing = new LinearWorkspaceConnectionBuilder()
      .withWorkspaceName('Old Workspace')
      .build();
    connectionGateway.connection = existing;

    await usecase.execute({
      code: 'new-code',
      redirectUri: 'http://localhost:3000/callback',
    });

    const saved = await connectionGateway.get();
    expect(saved?.workspaceName).toBe('My Workspace');
  });

  it('rejects when Linear API exchange fails', async () => {
    const failingApi = new FailingLinearApiGateway();
    const failingUsecase = new ConnectLinearWorkspaceUsecase(
      connectionGateway,
      failingApi,
      tokenEncryptionGateway,
    );

    await expect(
      failingUsecase.execute({
        code: 'invalid-code',
        redirectUri: 'http://localhost:3000/callback',
      }),
    ).rejects.toThrow(
      'La connexion à Linear a été refusée. Veuillez réessayer.',
    );
  });

  it('rejects when granted scopes are insufficient', async () => {
    linearApiGateway.grantedScopes = ['read'];

    await expect(
      usecase.execute({
        code: 'valid-code',
        redirectUri: 'http://localhost:3000/callback',
      }),
    ).rejects.toThrow(
      'Les permissions accordées sont insuffisantes. Veuillez autoriser tous les accès demandés.',
    );
  });
});
