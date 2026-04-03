export abstract class TeamSettingsGateway {
  abstract getExcludedStatuses(teamId: string): Promise<string[]>;
  abstract setExcludedStatuses(
    teamId: string,
    statuses: string[],
  ): Promise<void>;
}
