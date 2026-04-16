import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import { type TeamCyclesGateway } from '../entities/team-cycles/team-cycles.gateway.ts';
import { type TeamCyclesResponse } from '../entities/team-cycles/team-cycles.response.ts';

export interface ListTeamCyclesParams {
  teamId: string;
}

export class ListTeamCyclesUsecase
  implements Usecase<ListTeamCyclesParams, TeamCyclesResponse>
{
  constructor(private readonly gateway: TeamCyclesGateway) {}

  async execute(params: ListTeamCyclesParams): Promise<TeamCyclesResponse> {
    return this.gateway.fetchCyclesForTeam(params.teamId);
  }
}
