import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { TeamSettingsGateway } from '../entities/team-settings/team-settings.gateway.js';

interface SetExcludedStatusesParams {
  teamId: string;
  statuses: string[];
}

@Injectable()
export class SetTeamExcludedStatusesUsecase
  implements Usecase<SetExcludedStatusesParams, void>
{
  constructor(private readonly teamSettingsGateway: TeamSettingsGateway) {}

  async execute(params: SetExcludedStatusesParams): Promise<void> {
    await this.teamSettingsGateway.setExcludedStatuses(
      params.teamId,
      params.statuses,
    );
  }
}
