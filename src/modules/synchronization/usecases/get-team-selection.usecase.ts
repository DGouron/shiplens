import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { TeamSelectionGateway } from '../entities/team-selection/team-selection.gateway.js';
import { type TeamSelection } from '../entities/team-selection/team-selection.js';

@Injectable()
export class GetTeamSelectionUsecase
  implements Usecase<void, TeamSelection | null>
{
  constructor(
    private readonly teamSelectionGateway: TeamSelectionGateway,
  ) {}

  async execute(): Promise<TeamSelection | null> {
    return this.teamSelectionGateway.get();
  }
}
