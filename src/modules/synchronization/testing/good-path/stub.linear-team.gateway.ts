import {
  LinearTeamGateway,
  type LinearTeam,
} from '../../entities/team-selection/linear-team.gateway.js';

export class StubLinearTeamGateway extends LinearTeamGateway {
  teams: LinearTeam[] = [
    {
      teamId: 'team-1',
      teamName: 'Frontend',
      projects: [
        { projectId: 'proj-1', projectName: 'v2 Launch', teamId: 'team-1' },
        { projectId: 'proj-2', projectName: 'Design System', teamId: 'team-1' },
      ],
    },
    {
      teamId: 'team-2',
      teamName: 'Backend',
      projects: [
        { projectId: 'proj-3', projectName: 'API v3', teamId: 'team-2' },
      ],
    },
  ];

  issueCountEstimate = 150;
  lastUsedToken: string | null = null;

  async getTeams(accessToken: string): Promise<LinearTeam[]> {
    this.lastUsedToken = accessToken;
    return this.teams;
  }

  async getIssueCountEstimate(
    accessToken: string,
    _teamIds: string[],
    _projectIds: string[],
  ): Promise<number> {
    this.lastUsedToken = accessToken;
    return this.issueCountEstimate;
  }
}
