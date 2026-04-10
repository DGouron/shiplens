import { Injectable } from '@nestjs/common';
import { GatewayError } from '@shared/foundation/gateway-error.js';
import { LinearReferenceDataGateway } from '../../entities/reference-data/linear-reference-data.gateway.js';
import { type TeamReferenceData } from '../../entities/reference-data/reference-data.schema.js';

interface LinearGraphqlLabel {
  id: string;
  name: string;
  color: string;
}

interface LinearGraphqlWorkflowState {
  id: string;
  name: string;
  position: number;
}

interface LinearGraphqlMember {
  id: string;
  name: string;
  admin: boolean;
}

interface LinearGraphqlMilestone {
  id: string;
  name: string;
}

interface LinearGraphqlProject {
  id: string;
  name: string;
  projectMilestones: {
    nodes: LinearGraphqlMilestone[];
  };
}

interface LinearGraphqlTeamResponse {
  team: {
    labels: { nodes: LinearGraphqlLabel[] };
    states: { nodes: LinearGraphqlWorkflowState[] };
    members: { nodes: LinearGraphqlMember[] };
    projects: { nodes: LinearGraphqlProject[] };
  };
}

@Injectable()
export class LinearReferenceDataInHttpGateway extends LinearReferenceDataGateway {
  async getTeamReferenceData(
    accessToken: string,
    teamId: string,
  ): Promise<TeamReferenceData> {
    const body = await this.graphql<LinearGraphqlTeamResponse>(
      accessToken,
      `query($teamId: String!) {
        team(id: $teamId) {
          labels {
            nodes { id name color }
          }
          states {
            nodes { id name position }
          }
          members {
            nodes { id name admin }
          }
          projects {
            nodes {
              id
              name
              projectMilestones {
                nodes { id name }
              }
            }
          }
        }
      }`,
      { teamId },
    );

    const team = body.team;

    return {
      teamId,
      labels: team.labels.nodes.map((label) => ({
        externalId: label.id,
        teamId,
        name: label.name,
        color: label.color,
      })),
      workflowStatuses: team.states.nodes
        .sort((first, second) => first.position - second.position)
        .map((state) => ({
          externalId: state.id,
          teamId,
          name: state.name,
          position: state.position,
        })),
      teamMembers: team.members.nodes.map((member) => ({
        externalId: member.id,
        teamId,
        name: member.name,
        role: member.admin ? 'admin' : 'member',
      })),
      projects: team.projects.nodes.map((project) => ({
        externalId: project.id,
        teamId,
        name: project.name,
        milestones: project.projectMilestones.nodes.map((milestone) => ({
          externalId: milestone.id,
          projectExternalId: project.id,
          name: milestone.name,
        })),
      })),
    };
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
