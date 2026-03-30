import {
  LinearTeamGateway,
  type LinearTeam,
} from '../../entities/team-selection/linear-team.gateway.js';
import { GatewayError } from '@shared/foundation/gateway-error.js';

export class FailingLinearTeamGateway extends LinearTeamGateway {
  async getTeams(_accessToken: string): Promise<LinearTeam[]> {
    throw new GatewayError('Failed to fetch teams from Linear API');
  }

  async getIssueCountEstimate(
    _accessToken: string,
    _teamIds: string[],
    _projectIds: string[],
  ): Promise<number> {
    throw new GatewayError('Failed to estimate issue count from Linear API');
  }
}
