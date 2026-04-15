import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { TeamCyclesGateway } from '../../entities/team-cycles/team-cycles.gateway.ts';

export class FailingTeamCyclesGateway extends TeamCyclesGateway {
  async fetchCyclesForTeam(): Promise<never> {
    throw new GatewayError('Failed to fetch team cycles');
  }
}
