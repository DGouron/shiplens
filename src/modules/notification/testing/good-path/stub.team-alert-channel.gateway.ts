import { TeamAlertChannelGateway } from '../../entities/team-alert-channel/team-alert-channel.gateway.js';
import { type TeamAlertChannel } from '../../entities/team-alert-channel/team-alert-channel.js';

export class StubTeamAlertChannelGateway extends TeamAlertChannelGateway {
  private channels: TeamAlertChannel[] = [];

  async findByTeamId(teamId: string): Promise<TeamAlertChannel | null> {
    return this.channels.find((channel) => channel.teamId === teamId) ?? null;
  }

  async save(channel: TeamAlertChannel): Promise<void> {
    const existingIndex = this.channels.findIndex(
      (existing) => existing.teamId === channel.teamId,
    );
    if (existingIndex >= 0) {
      this.channels[existingIndex] = channel;
    } else {
      this.channels.push(channel);
    }
  }
}
