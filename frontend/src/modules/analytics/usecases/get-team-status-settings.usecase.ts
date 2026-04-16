import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import { type TeamSettingsGateway } from '../entities/team-settings/team-settings.gateway.ts';

interface TeamStatusSettings {
  availableStatuses: string[];
  excludedStatuses: string[];
}

export class GetTeamStatusSettingsUsecase
  implements Usecase<string, TeamStatusSettings>
{
  constructor(private readonly gateway: TeamSettingsGateway) {}

  async execute(teamId: string): Promise<TeamStatusSettings> {
    const [available, excluded] = await Promise.all([
      this.gateway.getAvailableStatuses(teamId),
      this.gateway.getExcludedStatuses(teamId),
    ]);

    return {
      availableStatuses: available.statuses,
      excludedStatuses: excluded.statuses,
    };
  }
}
