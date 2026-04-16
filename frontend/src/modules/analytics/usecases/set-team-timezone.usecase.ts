import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import { type TeamSettingsGateway } from '../entities/team-settings/team-settings.gateway.ts';

interface SetTeamTimezoneParams {
  teamId: string;
  timezone: string;
}

export class SetTeamTimezoneUsecase
  implements Usecase<SetTeamTimezoneParams, void>
{
  constructor(private readonly gateway: TeamSettingsGateway) {}

  async execute(params: SetTeamTimezoneParams): Promise<void> {
    await this.gateway.setTimezone(params.teamId, params.timezone);
  }
}
