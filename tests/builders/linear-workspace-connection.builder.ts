import { EntityBuilder } from '@shared/foundation/testing/entity-builder.js';
import { LinearWorkspaceConnection } from '@modules/identity/entities/linear-workspace-connection/linear-workspace-connection.js';
import { type LinearWorkspaceConnectionProps } from '@modules/identity/entities/linear-workspace-connection/linear-workspace-connection.schema.js';

const defaultProps: LinearWorkspaceConnectionProps = {
  id: 'connection-1',
  workspaceId: 'workspace-123',
  workspaceName: 'Test Workspace',
  encryptedAccessToken: 'encrypted:test-access-token',
  encryptedRefreshToken: 'encrypted:test-refresh-token',
  grantedScopes: ['read', 'write', 'issues:create'],
  status: 'connected',
  connectedAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

export class LinearWorkspaceConnectionBuilder extends EntityBuilder<
  LinearWorkspaceConnectionProps,
  LinearWorkspaceConnection
> {
  constructor() {
    super(defaultProps);
  }

  withWorkspaceName(name: string): this {
    this.props.workspaceName = name;
    return this;
  }

  withStatus(status: 'connected' | 'disconnected'): this {
    this.props.status = status;
    return this;
  }

  withEncryptedAccessToken(token: string): this {
    this.props.encryptedAccessToken = token;
    return this;
  }

  withEncryptedRefreshToken(token: string): this {
    this.props.encryptedRefreshToken = token;
    return this;
  }

  withWorkspaceId(workspaceId: string): this {
    this.props.workspaceId = workspaceId;
    return this;
  }

  withGrantedScopes(scopes: string[]): this {
    this.props.grantedScopes = scopes;
    return this;
  }

  build(): LinearWorkspaceConnection {
    return LinearWorkspaceConnection.create({ ...this.props });
  }
}
