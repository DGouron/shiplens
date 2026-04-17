import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import { type TeamSelectionStorageGateway } from '../entities/team-selection/team-selection.gateway.ts';

interface GetPersistedTeamSelectionParams {
  workspaceId: string;
}

export class GetPersistedTeamSelectionUsecase
  implements Usecase<GetPersistedTeamSelectionParams, string | null>
{
  constructor(private readonly storage: TeamSelectionStorageGateway) {}

  async execute({
    workspaceId,
  }: GetPersistedTeamSelectionParams): Promise<string | null> {
    return this.storage.read(workspaceId);
  }
}
