import { FailingLinearApiGateway } from '@modules/identity/testing/bad-path/failing.linear-api.gateway.js';
import { StubLinearApiGateway } from '@modules/identity/testing/good-path/stub.linear-api.gateway.js';
import { StubLinearWorkspaceConnectionGateway } from '@modules/identity/testing/good-path/stub.linear-workspace-connection.gateway.js';
import { StubTokenEncryptionGateway } from '@modules/identity/testing/good-path/stub.token-encryption.gateway.js';
import { ConnectWithApiKeyUsecase } from '@modules/identity/usecases/connect-with-api-key.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { LinearWorkspaceConnectionBuilder } from '../../../builders/linear-workspace-connection.builder.js';

describe('ConnectWithApiKeyUsecase', () => {
  let connectionGateway: StubLinearWorkspaceConnectionGateway;
  let linearApiGateway: StubLinearApiGateway;
  let tokenEncryptionGateway: StubTokenEncryptionGateway;
  let usecase: ConnectWithApiKeyUsecase;

  beforeEach(() => {
    connectionGateway = new StubLinearWorkspaceConnectionGateway();
    linearApiGateway = new StubLinearApiGateway();
    tokenEncryptionGateway = new StubTokenEncryptionGateway();
    usecase = new ConnectWithApiKeyUsecase(
      connectionGateway,
      linearApiGateway,
      tokenEncryptionGateway,
    );
  });

  it('validates API key by calling Linear and creates a connected workspace', async () => {
    await usecase.execute({ apiKey: 'lin_api_test123' });

    const saved = await connectionGateway.get();
    expect(saved).not.toBeNull();
    expect(saved?.status).toBe('connected');
    expect(saved?.workspaceName).toBe('My Workspace');
    expect(saved?.workspaceId).toBe('workspace-123');
  });

  it('encrypts API key as access token with empty refresh token', async () => {
    await usecase.execute({ apiKey: 'lin_api_test123' });

    const saved = await connectionGateway.get();
    expect(saved?.encryptedAccessToken).toBe('encrypted:lin_api_test123');
    expect(saved?.encryptedRefreshToken).toBe('');
  });

  it('replaces existing connection', async () => {
    const existing = new LinearWorkspaceConnectionBuilder()
      .withWorkspaceName('Old Workspace')
      .build();
    connectionGateway.connection = existing;

    await usecase.execute({ apiKey: 'lin_api_test123' });

    const saved = await connectionGateway.get();
    expect(saved?.workspaceName).toBe('My Workspace');
  });

  it('rejects when API key is invalid', async () => {
    const failingApi = new FailingLinearApiGateway();
    const failingUsecase = new ConnectWithApiKeyUsecase(
      connectionGateway,
      failingApi,
      tokenEncryptionGateway,
    );

    await expect(
      failingUsecase.execute({ apiKey: 'invalid-key' }),
    ).rejects.toThrow('La clé API Linear est invalide ou inaccessible.');
  });
});
