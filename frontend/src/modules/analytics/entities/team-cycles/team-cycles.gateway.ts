import { type TeamCyclesResponse } from './team-cycles.response.ts';

export abstract class TeamCyclesGateway {
  abstract fetchCyclesForTeam(teamId: string): Promise<TeamCyclesResponse>;
}
