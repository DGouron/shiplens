import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import { type TeamSettingsGateway } from '../entities/team-settings/team-settings.gateway.ts';
import { type TimezoneResponse } from '../entities/team-settings/team-settings.response.ts';

export class GetTeamTimezoneUsecase
  implements Usecase<string, TimezoneResponse>
{
  constructor(private readonly gateway: TeamSettingsGateway) {}

  async execute(teamId: string): Promise<TimezoneResponse> {
    return this.gateway.getTimezone(teamId);
  }
}
