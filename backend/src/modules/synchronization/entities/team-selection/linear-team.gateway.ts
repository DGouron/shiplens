export interface LinearTeam {
  teamId: string;
  teamName: string;
  projects: LinearProject[];
}

export interface LinearProject {
  projectId: string;
  projectName: string;
  teamId: string;
}

export abstract class LinearTeamGateway {
  abstract getTeams(accessToken: string): Promise<LinearTeam[]>;
  abstract getIssueCountEstimate(
    accessToken: string,
    teamIds: string[],
    projectIds: string[],
  ): Promise<number>;
}
