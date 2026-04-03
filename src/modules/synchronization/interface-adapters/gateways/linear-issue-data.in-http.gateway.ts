import { Injectable } from '@nestjs/common';
import { GatewayError } from '@shared/foundation/gateway-error.js';
import { LinearIssueDataGateway } from '../../entities/issue-data/linear-issue-data.gateway.js';
import {
  type PaginatedIssues,
  type CycleData,
  type StateTransitionData,
} from '../../entities/issue-data/issue-data.schema.js';

interface LinearGraphqlIssue {
  id: string;
  title: string;
  state: { name: string; type: string };
  estimate: number | null;
  labels: { nodes: Array<{ id: string }> };
  assignee: { name: string } | null;
  createdAt: string;
  updatedAt: string;
}

interface LinearGraphqlIssuesResponse {
  team: {
    issues: {
      nodes: LinearGraphqlIssue[];
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
    };
  };
}

interface LinearGraphqlPageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

interface LinearGraphqlCycle {
  id: string;
  name: string | null;
  number: number | null;
  startsAt: string;
  endsAt: string;
  issues: {
    nodes: Array<{ id: string }>;
    pageInfo: LinearGraphqlPageInfo;
  };
}

interface LinearGraphqlCycleIssuesResponse {
  cycle: {
    issues: {
      nodes: Array<{ id: string }>;
      pageInfo: LinearGraphqlPageInfo;
    };
  };
}

interface LinearGraphqlCyclesResponse {
  team: {
    cycles: {
      nodes: LinearGraphqlCycle[];
    };
  };
}

interface LinearGraphqlHistoryEntry {
  id: string;
  fromState: { name: string; type: string } | null;
  toState: { name: string; type: string } | null;
  createdAt: string;
}

interface LinearGraphqlIssueHistoryResponse {
  issue: {
    history: {
      nodes: LinearGraphqlHistoryEntry[];
    };
  };
}

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

@Injectable()
export class LinearIssueDataInHttpGateway extends LinearIssueDataGateway {
  async getIssuesPage(
    accessToken: string,
    teamId: string,
    cursor: string | null,
  ): Promise<PaginatedIssues> {
    const variables: Record<string, unknown> = { teamId, first: 50 };
    if (cursor) {
      variables.after = cursor;
    }

    const afterClause = cursor ? ', $after: String' : '';
    const afterArg = cursor ? ', after: $after' : '';

    const body = await this.graphql<LinearGraphqlIssuesResponse>(
      accessToken,
      `query($teamId: String!, $first: Int!${afterClause}) {
        team(id: $teamId) {
          issues(first: $first${afterArg}) {
            nodes {
              id title
              state { name type }
              estimate
              labels { nodes { id } }
              assignee { name }
              createdAt updatedAt
            }
            pageInfo { hasNextPage endCursor }
          }
        }
      }`,
      variables,
    );

    const issues = body.team.issues;
    return {
      issues: issues.nodes.map((issue) => ({
        externalId: issue.id,
        teamId,
        title: issue.title,
        statusName: issue.state.name,
        statusType: issue.state.type,
        points: issue.estimate,
        labelIds: JSON.stringify(issue.labels.nodes.map((label) => label.id)),
        assigneeName: issue.assignee?.name ?? null,
        createdAt: issue.createdAt,
        updatedAt: issue.updatedAt,
      })),
      hasNextPage: issues.pageInfo.hasNextPage,
      endCursor: issues.pageInfo.endCursor,
    };
  }

  async getCycles(
    accessToken: string,
    teamId: string,
  ): Promise<CycleData[]> {
    const body = await this.graphql<LinearGraphqlCyclesResponse>(
      accessToken,
      `query($teamId: String!) {
        team(id: $teamId) {
          cycles(includeArchived: true) {
            nodes {
              id name number startsAt endsAt
              issues(first: 50) {
                nodes { id }
                pageInfo { hasNextPage endCursor }
              }
            }
          }
        }
      }`,
      { teamId },
    );

    const cycles: CycleData[] = [];

    for (const cycle of body.team.cycles.nodes) {
      const issueIds = cycle.issues.nodes.map((issue) => issue.id);

      let { hasNextPage } = cycle.issues.pageInfo;
      let cursor = cycle.issues.pageInfo.endCursor;

      while (hasNextPage && cursor) {
        const page = await this.fetchCycleIssueIds(accessToken, cycle.id, cursor);
        issueIds.push(...page.issueIds);
        hasNextPage = page.hasNextPage;
        cursor = page.endCursor;
      }

      cycles.push({
        externalId: cycle.id,
        teamId,
        name: cycle.name ?? (cycle.number ? `Cycle ${cycle.number}` : null),
        startsAt: cycle.startsAt,
        endsAt: cycle.endsAt,
        issueExternalIds: JSON.stringify(issueIds),
      });
    }

    return cycles;
  }

  private async fetchCycleIssueIds(
    accessToken: string,
    cycleId: string,
    cursor: string,
  ): Promise<{ issueIds: string[]; hasNextPage: boolean; endCursor: string | null }> {
    const body = await this.graphql<LinearGraphqlCycleIssuesResponse>(
      accessToken,
      `query($cycleId: String!, $after: String!) {
        cycle(id: $cycleId) {
          issues(first: 50, after: $after) {
            nodes { id }
            pageInfo { hasNextPage endCursor }
          }
        }
      }`,
      { cycleId, after: cursor },
    );

    return {
      issueIds: body.cycle.issues.nodes.map((issue) => issue.id),
      hasNextPage: body.cycle.issues.pageInfo.hasNextPage,
      endCursor: body.cycle.issues.pageInfo.endCursor,
    };
  }

  async getIssueHistory(
    accessToken: string,
    teamId: string,
    issueExternalIds: string[],
  ): Promise<StateTransitionData[]> {
    const transitions: StateTransitionData[] = [];

    for (const issueExternalId of issueExternalIds) {
      const body = await this.graphql<LinearGraphqlIssueHistoryResponse>(
        accessToken,
        `query($issueId: String!) {
          issue(id: $issueId) {
            history {
              nodes { id fromState { name type } toState { name type } createdAt }
            }
          }
        }`,
        { issueId: issueExternalId },
      );

      const stateChanges = body.issue.history.nodes.filter(
        (entry) => entry.toState !== null,
      );

      for (const entry of stateChanges) {
        transitions.push({
          externalId: entry.id,
          issueExternalId,
          teamId,
          fromStatusName: entry.fromState?.name ?? null,
          fromStatusType: entry.fromState?.type ?? null,
          toStatusName: entry.toState?.name ?? '',
          toStatusType: entry.toState?.type ?? '',
          occurredAt: entry.createdAt,
        });
      }
    }

    return transitions;
  }

  private async graphql<T>(
    accessToken: string,
    query: string,
    variables?: Record<string, unknown>,
  ): Promise<T> {
    return this.graphqlWithRetry<T>(accessToken, query, variables, 0);
  }

  private async graphqlWithRetry<T>(
    accessToken: string,
    query: string,
    variables: Record<string, unknown> | undefined,
    attempt: number,
  ): Promise<T> {
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: accessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (response.status === 429 && attempt < MAX_RETRIES) {
      const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
      return this.graphqlWithRetry<T>(
        accessToken,
        query,
        variables,
        attempt + 1,
      );
    }

    if (!response.ok) {
      throw new GatewayError('Échec de la requête Linear API', {
        status: response.status,
      });
    }

    const result = (await response.json()) as { data: T };
    return result.data;
  }
}
