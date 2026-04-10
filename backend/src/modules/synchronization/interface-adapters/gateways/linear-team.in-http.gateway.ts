import { Injectable } from '@nestjs/common';
import { GatewayError } from '@shared/foundation/gateway-error.js';
import {
  type LinearTeam,
  LinearTeamGateway,
} from '../../entities/team-selection/linear-team.gateway.js';

interface LinearGraphqlTeam {
  id: string;
  name: string;
  projects: {
    nodes: Array<{
      id: string;
      name: string;
      state: string;
    }>;
  };
}

interface LinearGraphqlIssueCount {
  issueCount: number;
}

@Injectable()
export class LinearTeamInHttpGateway extends LinearTeamGateway {
  async getTeams(accessToken: string): Promise<LinearTeam[]> {
    const body = await this.graphql<{ teams: { nodes: LinearGraphqlTeam[] } }>(
      accessToken,
      `{
        teams {
          nodes {
            id
            name
            projects {
              nodes {
                id
                name
                state
              }
            }
          }
        }
      }`,
    );

    return body.teams.nodes.map((team) => ({
      teamId: team.id,
      teamName: team.name,
      projects: team.projects.nodes
        .filter(
          (project) =>
            project.state === 'started' || project.state === 'planned',
        )
        .map((project) => ({
          projectId: project.id,
          projectName: project.name,
          teamId: team.id,
        })),
    }));
  }

  async getIssueCountEstimate(
    accessToken: string,
    teamIds: string[],
    _projectIds: string[],
  ): Promise<number> {
    let totalCount = 0;

    for (const teamId of teamIds) {
      const body = await this.graphql<{ team: LinearGraphqlIssueCount }>(
        accessToken,
        `query($teamId: String!) {
          team(id: $teamId) {
            issueCount
          }
        }`,
        { teamId },
      );
      totalCount += body.team.issueCount;
    }

    return totalCount;
  }

  private async graphql<T>(
    accessToken: string,
    query: string,
    variables?: Record<string, unknown>,
  ): Promise<T> {
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: accessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new GatewayError('Échec de la requête Linear API', {
        status: response.status,
      });
    }

    const result = (await response.json()) as { data: T };
    return result.data;
  }
}
