import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import {
  type SaveSyncSelectionInput,
  SyncGateway,
  type SyncTeamIssuesInput,
} from '../../entities/sync/sync.gateway.ts';
import {
  type SyncAvailableTeamResponse,
  type SyncSelectionResponse,
} from '../../entities/sync/sync.response.ts';
import {
  syncAvailableTeamsResponseGuard,
  syncSelectionResponseGuard,
} from './sync.response.guard.ts';

export class SyncInHttpGateway extends SyncGateway {
  async fetchAvailableTeams(): Promise<SyncAvailableTeamResponse[]> {
    const response = await fetch('/sync/teams');
    if (!response.ok) {
      throw new GatewayError(
        `Failed to fetch available teams: HTTP ${response.status}`,
      );
    }
    const payload: unknown = await response.json();
    const parsed = syncAvailableTeamsResponseGuard.safeParse(payload);
    if (!parsed.success) {
      throw new GatewayError(
        `Invalid available teams response payload: ${parsed.error.message}`,
      );
    }
    return parsed.data;
  }

  async saveSelection(input: SaveSyncSelectionInput): Promise<void> {
    const response = await fetch('/sync/selection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      throw new GatewayError(
        `Failed to save sync selection: HTTP ${response.status}`,
      );
    }
  }

  async fetchSelection(): Promise<SyncSelectionResponse> {
    const response = await fetch('/sync/selection');
    if (!response.ok) {
      throw new GatewayError(
        `Failed to fetch sync selection: HTTP ${response.status}`,
      );
    }
    const payload: unknown = await response.json();
    const parsed = syncSelectionResponseGuard.safeParse(payload);
    if (!parsed.success) {
      throw new GatewayError(
        `Invalid sync selection response payload: ${parsed.error.message}`,
      );
    }
    return parsed.data;
  }

  async syncReferenceData(): Promise<void> {
    const response = await fetch('/sync/reference-data', { method: 'POST' });
    if (!response.ok) {
      throw new GatewayError(
        `Failed to sync reference data: HTTP ${response.status}`,
      );
    }
  }

  async syncTeamIssues(input: SyncTeamIssuesInput): Promise<void> {
    const response = await fetch('/sync/issue-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      throw new GatewayError(
        `Failed to sync team issues: HTTP ${response.status}`,
      );
    }
  }
}
