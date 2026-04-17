import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import { type TeamSelectionStorageGateway } from '../entities/team-selection/team-selection.gateway.ts';

interface PersistTeamSelectionParams {
  workspaceId: string;
  teamId: string;
}

export class PersistTeamSelectionUsecase
  implements Usecase<PersistTeamSelectionParams, void>
{
  constructor(private readonly storage: TeamSelectionStorageGateway) {}

  async execute({
    workspaceId,
    teamId,
  }: PersistTeamSelectionParams): Promise<void> {
    this.storage.write(workspaceId, teamId);
  }
}
