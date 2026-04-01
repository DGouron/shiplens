import { TeamAlertChannelGateway } from '../../entities/team-alert-channel/team-alert-channel.gateway.js';
import { type TeamAlertChannel } from '../../entities/team-alert-channel/team-alert-channel.js';
import { GatewayError } from '@shared/foundation/gateway-error.js';

export class FailingTeamAlertChannelGateway extends TeamAlertChannelGateway {
  async findByTeamId(_teamId: string): Promise<TeamAlertChannel | null> {
    throw new GatewayError('Database unreachable');
  }

  async save(_channel: TeamAlertChannel): Promise<void> {
    throw new GatewayError('Database unreachable');
  }
}
