import { ConnectionStatusPresenter } from '@modules/identity/interface-adapters/presenters/connection-status.presenter.js';
import { describe, expect, it } from 'vitest';
import { LinearWorkspaceConnectionBuilder } from '../../../../builders/linear-workspace-connection.builder.js';

describe('ConnectionStatusPresenter', () => {
  const presenter = new ConnectionStatusPresenter();

  it('presents null when no connection exists', () => {
    const result = presenter.present(null);

    expect(result).toEqual({ connected: false, workspace: null });
  });

  it('presents workspace info when connected', () => {
    const connection = new LinearWorkspaceConnectionBuilder()
      .withWorkspaceName('Acme Corp')
      .withWorkspaceId('ws-42')
      .build();

    const result = presenter.present(connection);

    expect(result).toEqual({
      connected: true,
      workspace: {
        id: 'ws-42',
        name: 'Acme Corp',
      },
    });
  });
});
