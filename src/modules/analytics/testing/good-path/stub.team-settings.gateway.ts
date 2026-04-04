import {
  DEFAULT_TIMEZONE,
  TeamSettingsGateway,
} from '../../entities/team-settings/team-settings.gateway.js';

export class StubTeamSettingsGateway extends TeamSettingsGateway {
  excludedStatuses: Map<string, string[]> = new Map();
  timezones: Map<string, string> = new Map();

  async getExcludedStatuses(teamId: string): Promise<string[]> {
    return this.excludedStatuses.get(teamId) ?? [];
  }

  async setExcludedStatuses(teamId: string, statuses: string[]): Promise<void> {
    this.excludedStatuses.set(teamId, statuses);
  }

  async getTimezone(teamId: string): Promise<string> {
    return this.timezones.get(teamId) ?? DEFAULT_TIMEZONE;
  }

  async setTimezone(teamId: string, timezone: string): Promise<void> {
    this.timezones.set(teamId, timezone);
  }
}
