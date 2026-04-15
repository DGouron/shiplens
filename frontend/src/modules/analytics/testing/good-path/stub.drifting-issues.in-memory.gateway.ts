import {
  DriftingIssuesGateway,
  type FetchDriftingIssuesParams,
} from '../../entities/drifting-issues/drifting-issues.gateway.ts';
import { type DriftingIssuesResponse } from '../../entities/drifting-issues/drifting-issues.response.ts';

interface StubDriftingIssuesGatewayOptions {
  response?: DriftingIssuesResponse;
}

export class StubDriftingIssuesGateway extends DriftingIssuesGateway {
  private readonly response: DriftingIssuesResponse;
  calls: FetchDriftingIssuesParams[] = [];

  constructor(options: StubDriftingIssuesGatewayOptions = {}) {
    super();
    this.response = options.response ?? [];
  }

  async fetchDriftingIssues(
    params: FetchDriftingIssuesParams,
  ): Promise<DriftingIssuesResponse> {
    this.calls.push(params);
    return this.response.map((issue) => ({ ...issue }));
  }
}
