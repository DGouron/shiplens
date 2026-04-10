import { linearWorkspaceConnectionGuard } from './linear-workspace-connection.guard.js';
import { type LinearWorkspaceConnectionProps } from './linear-workspace-connection.schema.js';

export class LinearWorkspaceConnection {
  private constructor(private readonly props: LinearWorkspaceConnectionProps) {}

  static create(props: unknown): LinearWorkspaceConnection {
    const validatedProps = linearWorkspaceConnectionGuard.parse(props);
    return new LinearWorkspaceConnection(validatedProps);
  }

  get id(): string {
    return this.props.id;
  }

  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get workspaceName(): string {
    return this.props.workspaceName;
  }

  get encryptedAccessToken(): string {
    return this.props.encryptedAccessToken;
  }

  get encryptedRefreshToken(): string {
    return this.props.encryptedRefreshToken;
  }

  get grantedScopes(): string[] {
    return this.props.grantedScopes;
  }

  get status(): 'connected' | 'disconnected' {
    return this.props.status;
  }

  get connectedAt(): Date {
    return this.props.connectedAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
