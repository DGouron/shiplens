import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import { type SyncGateway } from '../entities/sync/sync.gateway.ts';
import { type SyncAvailableTeamResponse } from '../entities/sync/sync.response.ts';
import { NoTeamsAvailableInWorkspace } from './discover-sync-teams.usecase.errors.ts';

export class DiscoverSyncTeamsUsecase
  implements Usecase<void, SyncAvailableTeamResponse[]>
{
  constructor(private readonly gateway: SyncGateway) {}

  async execute(): Promise<SyncAvailableTeamResponse[]> {
    const availableTeams = await this.gateway.fetchAvailableTeams();
    if (availableTeams.length === 0) {
      throw new NoTeamsAvailableInWorkspace();
    }
    return availableTeams;
  }
}
