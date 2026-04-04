export const DEFAULT_TIMEZONE = 'Europe/Paris';

export abstract class TeamSettingsGateway {
  abstract getExcludedStatuses(teamId: string): Promise<string[]>;
  abstract setExcludedStatuses(
    teamId: string,
    statuses: string[],
  ): Promise<void>;
  abstract getTimezone(teamId: string): Promise<string>;
  abstract setTimezone(teamId: string, timezone: string): Promise<void>;
}
