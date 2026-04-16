import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { TeamCyclesGateway } from '../../entities/team-cycles/team-cycles.gateway.ts';
import { type TeamCyclesResponse } from '../../entities/team-cycles/team-cycles.response.ts';
import { teamCyclesResponseGuard } from './team-cycles.response.guard.ts';

export class TeamCyclesInHttpGateway extends TeamCyclesGateway {
  async fetchCyclesForTeam(teamId: string): Promise<TeamCyclesResponse> {
    const response = await fetch(`/analytics/teams/${teamId}/cycles`);
    if (!response.ok) {
      throw new GatewayError(
        `Failed to fetch team cycles: HTTP ${response.status}`,
      );
    }
    const payload: unknown = await response.json();
    const parsed = teamCyclesResponseGuard.safeParse(payload);
    if (!parsed.success) {
      throw new GatewayError(
        `Invalid team cycles response payload: ${parsed.error.message}`,
      );
    }
    return parsed.data;
  }
}
