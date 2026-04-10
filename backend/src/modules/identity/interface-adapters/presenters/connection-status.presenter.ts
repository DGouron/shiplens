import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';
import { type LinearWorkspaceConnection } from '../../entities/linear-workspace-connection/linear-workspace-connection.js';

export interface ConnectionStatusDto {
  connected: boolean;
  workspace: { id: string; name: string } | null;
}

@Injectable()
export class ConnectionStatusPresenter
  implements Presenter<LinearWorkspaceConnection | null, ConnectionStatusDto>
{
  present(connection: LinearWorkspaceConnection | null): ConnectionStatusDto {
    if (!connection) {
      return { connected: false, workspace: null };
    }

    return {
      connected: true,
      workspace: {
        id: connection.workspaceId,
        name: connection.workspaceName,
      },
    };
  }
}
