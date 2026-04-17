import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { TeamSelectionStorageGateway } from '../../entities/team-selection/team-selection.gateway.ts';

const STORAGE_KEY_PREFIX = 'shiplens.selectedTeamId:';

export class TeamSelectionInLocalStorageGateway extends TeamSelectionStorageGateway {
  read(workspaceId: string): string | null {
    try {
      return window.localStorage.getItem(storageKeyFor(workspaceId));
    } catch (error) {
      throw new GatewayError(
        `Failed to read team selection from localStorage: ${describe(error)}`,
      );
    }
  }

  write(workspaceId: string, teamId: string): void {
    try {
      window.localStorage.setItem(storageKeyFor(workspaceId), teamId);
    } catch (error) {
      throw new GatewayError(
        `Failed to write team selection to localStorage: ${describe(error)}`,
      );
    }
  }
}

function storageKeyFor(workspaceId: string): string {
  return `${STORAGE_KEY_PREFIX}${workspaceId}`;
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}
