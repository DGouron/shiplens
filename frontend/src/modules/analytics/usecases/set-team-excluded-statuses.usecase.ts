import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import { type TeamSettingsGateway } from '../entities/team-settings/team-settings.gateway.ts';

interface SetTeamExcludedStatusesParams {
  teamId: string;
  statuses: string[];
}

export class SetTeamExcludedStatusesUsecase
  implements Usecase<SetTeamExcludedStatusesParams, void>
{
  constructor(private readonly gateway: TeamSettingsGateway) {}

  async execute(params: SetTeamExcludedStatusesParams): Promise<void> {
    await this.gateway.setExcludedStatuses(params.teamId, params.statuses);
  }
}
