import { TeamCyclesGateway } from '../../entities/team-cycles/team-cycles.gateway.ts';
import { type TeamCyclesResponse } from '../../entities/team-cycles/team-cycles.response.ts';

interface StubTeamCyclesGatewayOptions {
  response?: TeamCyclesResponse;
  responsesByTeamId?: Record<string, TeamCyclesResponse>;
}

const defaultResponse: TeamCyclesResponse = {
  cycles: [
    {
      externalId: 'cycle-1',
      name: 'Cycle 12',
      startsAt: '2026-04-01T00:00:00.000Z',
      endsAt: '2026-04-14T23:59:59.999Z',
      issueCount: 10,
      status: 'in_progress',
    },
  ],
};

export class StubTeamCyclesGateway extends TeamCyclesGateway {
  private readonly response: TeamCyclesResponse;
  private readonly responsesByTeamId: Record<string, TeamCyclesResponse>;
  calls: string[] = [];

  constructor(options: StubTeamCyclesGatewayOptions = {}) {
    super();
    this.response = options.response ?? defaultResponse;
    this.responsesByTeamId = options.responsesByTeamId ?? {};
  }

  async fetchCyclesForTeam(teamId: string): Promise<TeamCyclesResponse> {
    this.calls.push(teamId);
    return this.responsesByTeamId[teamId] ?? this.response;
  }
}
