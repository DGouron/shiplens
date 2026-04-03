import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { TeamSettingsGateway } from '../entities/team-settings/team-settings.gateway.js';

@Injectable()
export class GetTeamExcludedStatusesUsecase
  implements Usecase<string, string[]>
{
  constructor(private readonly teamSettingsGateway: TeamSettingsGateway) {}

  async execute(teamId: string): Promise<string[]> {
    return this.teamSettingsGateway.getExcludedStatuses(teamId);
  }
}
