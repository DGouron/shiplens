import { type LinearWorkspaceConnection } from './linear-workspace-connection.js';

export abstract class LinearWorkspaceConnectionGateway {
  abstract save(connection: LinearWorkspaceConnection): Promise<void>;
  abstract get(): Promise<LinearWorkspaceConnection | null>;
  abstract delete(): Promise<void>;
}
