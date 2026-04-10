import { StubLinearWorkspaceConnectionGateway } from '@modules/identity/testing/good-path/stub.linear-workspace-connection.gateway.js';
import { GetConnectionStatusUsecase } from '@modules/identity/usecases/get-connection-status.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { LinearWorkspaceConnectionBuilder } from '../../../builders/linear-workspace-connection.builder.js';

describe('GetConnectionStatusUsecase', () => {
  let connectionGateway: StubLinearWorkspaceConnectionGateway;
  let usecase: GetConnectionStatusUsecase;

  beforeEach(() => {
    connectionGateway = new StubLinearWorkspaceConnectionGateway();
    usecase = new GetConnectionStatusUsecase(connectionGateway);
  });

  it('returns null when no connection exists', async () => {
    const result = await usecase.execute();

    expect(result).toBeNull();
  });

  it('returns connection details when connected', async () => {
    connectionGateway.connection = new LinearWorkspaceConnectionBuilder()
      .withWorkspaceName('Acme Corp')
      .build();

    const result = await usecase.execute();

    expect(result).not.toBeNull();
    expect(result?.workspaceName).toBe('Acme Corp');
    expect(result?.status).toBe('connected');
  });
});
