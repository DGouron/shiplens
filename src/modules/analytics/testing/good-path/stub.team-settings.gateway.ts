import { TeamSettingsGateway } from '../../entities/team-settings/team-settings.gateway.js';

export class StubTeamSettingsGateway extends TeamSettingsGateway {
  excludedStatuses: Map<string, string[]> = new Map();

  async getExcludedStatuses(teamId: string): Promise<string[]> {
    return this.excludedStatuses.get(teamId) ?? [];
  }

  async setExcludedStatuses(teamId: string, statuses: string[]): Promise<void> {
    this.excludedStatuses.set(teamId, statuses);
  }
}
