import { TeamSettingsGateway } from '../../entities/team-settings/team-settings.gateway.ts';
import {
  type StatusListResponse,
  type TimezoneResponse,
} from '../../entities/team-settings/team-settings.response.ts';

export class StubTeamSettingsGateway extends TeamSettingsGateway {
  timezones: Map<string, string> = new Map();
  availableStatuses: Map<string, string[]> = new Map();
  excludedStatuses: Map<string, string[]> = new Map();

  async getTimezone(teamId: string): Promise<TimezoneResponse> {
    return { timezone: this.timezones.get(teamId) ?? 'Europe/Paris' };
  }

  async setTimezone(teamId: string, timezone: string): Promise<void> {
    this.timezones.set(teamId, timezone);
  }

  async getAvailableStatuses(teamId: string): Promise<StatusListResponse> {
    return { statuses: this.availableStatuses.get(teamId) ?? [] };
  }

  async getExcludedStatuses(teamId: string): Promise<StatusListResponse> {
    return { statuses: this.excludedStatuses.get(teamId) ?? [] };
  }

  async setExcludedStatuses(teamId: string, statuses: string[]): Promise<void> {
    this.excludedStatuses.set(teamId, statuses);
  }
}
