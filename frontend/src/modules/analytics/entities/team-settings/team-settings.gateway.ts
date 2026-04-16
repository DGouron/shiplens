import {
  type StatusListResponse,
  type TimezoneResponse,
} from './team-settings.response.ts';

export abstract class TeamSettingsGateway {
  abstract getTimezone(teamId: string): Promise<TimezoneResponse>;
  abstract setTimezone(teamId: string, timezone: string): Promise<void>;
  abstract getAvailableStatuses(teamId: string): Promise<StatusListResponse>;
  abstract getExcludedStatuses(teamId: string): Promise<StatusListResponse>;
  abstract setExcludedStatuses(
    teamId: string,
    statuses: string[],
  ): Promise<void>;
}
