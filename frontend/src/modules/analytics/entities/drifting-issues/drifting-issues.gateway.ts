import { type DriftingIssuesResponse } from './drifting-issues.response.ts';

export interface FetchDriftingIssuesParams {
  teamId: string;
}

export abstract class DriftingIssuesGateway {
  abstract fetchDriftingIssues(
    params: FetchDriftingIssuesParams,
  ): Promise<DriftingIssuesResponse>;
}
