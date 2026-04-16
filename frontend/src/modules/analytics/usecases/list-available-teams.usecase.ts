import { type SyncGateway } from '@/modules/synchronization/entities/sync/sync.gateway.ts';
import { type SyncAvailableTeamResponse } from '@/modules/synchronization/entities/sync/sync.response.ts';
import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';

export class ListAvailableTeamsUsecase
  implements Usecase<void, SyncAvailableTeamResponse[]>
{
  constructor(private readonly syncGateway: SyncGateway) {}

  async execute(): Promise<SyncAvailableTeamResponse[]> {
    return this.syncGateway.fetchAvailableTeams();
  }
}
