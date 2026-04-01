import { type TeamAlertChannel } from './team-alert-channel.js';

export abstract class TeamAlertChannelGateway {
  abstract findByTeamId(teamId: string): Promise<TeamAlertChannel | null>;
  abstract save(channel: TeamAlertChannel): Promise<void>;
}
