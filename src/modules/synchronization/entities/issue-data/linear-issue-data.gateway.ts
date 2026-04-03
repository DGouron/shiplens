import {
  type CycleData,
  type PaginatedIssues,
  type StateTransitionData,
} from './issue-data.schema.js';

export abstract class LinearIssueDataGateway {
  abstract getIssuesPage(
    accessToken: string,
    teamId: string,
    cursor: string | null,
  ): Promise<PaginatedIssues>;

  abstract getCycles(accessToken: string, teamId: string): Promise<CycleData[]>;

  abstract getIssueHistory(
    accessToken: string,
    teamId: string,
    issueExternalIds: string[],
  ): Promise<StateTransitionData[]>;
}
