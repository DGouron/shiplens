import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { SyncGateway } from '../../entities/sync/sync.gateway.ts';

export class FailingSyncGateway extends SyncGateway {
  async fetchAvailableTeams(): Promise<never> {
    throw new GatewayError('Sync failed');
  }

  async saveSelection(): Promise<never> {
    throw new GatewayError('Sync failed');
  }

  async fetchSelection(): Promise<never> {
    throw new GatewayError('Sync failed');
  }

  async syncReferenceData(): Promise<never> {
    throw new GatewayError('Sync failed');
  }

  async syncTeamIssues(): Promise<never> {
    throw new GatewayError('Sync failed');
  }
}
