import { LinearWorkspaceConnectionGateway } from '../../entities/linear-workspace-connection/linear-workspace-connection.gateway.js';
import { type LinearWorkspaceConnection } from '../../entities/linear-workspace-connection/linear-workspace-connection.js';

export class StubLinearWorkspaceConnectionGateway extends LinearWorkspaceConnectionGateway {
  connection: LinearWorkspaceConnection | null = null;

  async save(connection: LinearWorkspaceConnection): Promise<void> {
    this.connection = connection;
  }

  async get(): Promise<LinearWorkspaceConnection | null> {
    return this.connection;
  }

  async delete(): Promise<void> {
    this.connection = null;
  }
}
