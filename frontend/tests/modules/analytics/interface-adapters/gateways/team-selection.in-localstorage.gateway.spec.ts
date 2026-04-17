import { afterEach, describe, expect, it, vi } from 'vitest';
import { TeamSelectionInLocalStorageGateway } from '@/modules/analytics/interface-adapters/gateways/team-selection.in-localstorage.gateway.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';

describe('TeamSelectionInLocalStorageGateway', () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('writes and reads back the selected team id for a given workspace', () => {
    const gateway = new TeamSelectionInLocalStorageGateway();

    gateway.write('workspace-1', 'team-alpha');

    expect(gateway.read('workspace-1')).toBe('team-alpha');
  });

  it('returns null when no selection has been written for the workspace', () => {
    const gateway = new TeamSelectionInLocalStorageGateway();

    expect(gateway.read('workspace-unknown')).toBeNull();
  });

  it('isolates selections by workspace key', () => {
    const gateway = new TeamSelectionInLocalStorageGateway();

    gateway.write('workspace-1', 'team-alpha');
    gateway.write('workspace-2', 'team-bravo');

    expect(gateway.read('workspace-1')).toBe('team-alpha');
    expect(gateway.read('workspace-2')).toBe('team-bravo');
  });

  it('throws GatewayError when localStorage.setItem fails', () => {
    const gateway = new TeamSelectionInLocalStorageGateway();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });

    expect(() => gateway.write('workspace-1', 'team-alpha')).toThrow(
      GatewayError,
    );
  });

  it('throws GatewayError when localStorage.getItem fails', () => {
    const gateway = new TeamSelectionInLocalStorageGateway();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage disabled');
    });

    expect(() => gateway.read('workspace-1')).toThrow(GatewayError);
  });
});
