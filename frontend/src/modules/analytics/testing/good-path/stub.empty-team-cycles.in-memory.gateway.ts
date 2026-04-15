import { TeamCyclesGateway } from '../../entities/team-cycles/team-cycles.gateway.ts';
import { type TeamCyclesResponse } from '../../entities/team-cycles/team-cycles.response.ts';

export class StubEmptyTeamCyclesGateway extends TeamCyclesGateway {
  async fetchCyclesForTeam(): Promise<TeamCyclesResponse> {
    return { cycles: [] };
  }
}
