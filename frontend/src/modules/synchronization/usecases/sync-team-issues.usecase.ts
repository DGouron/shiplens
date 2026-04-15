import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import { type SyncGateway } from '../entities/sync/sync.gateway.ts';

export interface SyncTeamIssuesInput {
  teamId: string;
}

export class SyncTeamIssuesUsecase
  implements Usecase<SyncTeamIssuesInput, void>
{
  constructor(private readonly gateway: SyncGateway) {}

  async execute(input: SyncTeamIssuesInput): Promise<void> {
    await this.gateway.syncTeamIssues({ teamId: input.teamId });
  }
}
