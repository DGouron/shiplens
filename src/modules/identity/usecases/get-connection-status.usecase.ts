import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { LinearWorkspaceConnectionGateway } from '../entities/linear-workspace-connection/linear-workspace-connection.gateway.js';
import { type LinearWorkspaceConnection } from '../entities/linear-workspace-connection/linear-workspace-connection.js';

@Injectable()
export class GetConnectionStatusUsecase implements Usecase<void, LinearWorkspaceConnection | null> {
  constructor(private readonly connectionGateway: LinearWorkspaceConnectionGateway) {}

  async execute(): Promise<LinearWorkspaceConnection | null> {
    return this.connectionGateway.get();
  }
}
