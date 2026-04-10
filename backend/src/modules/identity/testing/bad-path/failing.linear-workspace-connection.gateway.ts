import { GatewayError } from '@shared/foundation/gateway-error.js';
import { LinearWorkspaceConnectionGateway } from '../../entities/linear-workspace-connection/linear-workspace-connection.gateway.js';
import { type LinearWorkspaceConnection } from '../../entities/linear-workspace-connection/linear-workspace-connection.js';

export class FailingLinearWorkspaceConnectionGateway extends LinearWorkspaceConnectionGateway {
  async save(_connection: LinearWorkspaceConnection): Promise<void> {
    throw new GatewayError('Database connection failed');
  }

  async get(): Promise<LinearWorkspaceConnection | null> {
    throw new GatewayError('Database connection failed');
  }

  async delete(): Promise<void> {
    throw new GatewayError('Database connection failed');
  }
}
