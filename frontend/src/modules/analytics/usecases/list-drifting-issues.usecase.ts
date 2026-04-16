import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import {
  type DriftingIssuesGateway,
  type FetchDriftingIssuesParams,
} from '../entities/drifting-issues/drifting-issues.gateway.ts';
import { type DriftingIssuesResponse } from '../entities/drifting-issues/drifting-issues.response.ts';

export class ListDriftingIssuesUsecase
  implements Usecase<FetchDriftingIssuesParams, DriftingIssuesResponse>
{
  constructor(private readonly gateway: DriftingIssuesGateway) {}

  async execute(
    params: FetchDriftingIssuesParams,
  ): Promise<DriftingIssuesResponse> {
    return this.gateway.fetchDriftingIssues(params);
  }
}
