import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import { type TopCycleProjectsGateway } from '../entities/top-cycle-projects/top-cycle-projects.gateway.ts';
import { type CycleProjectIssuesResponse } from '../entities/top-cycle-projects/top-cycle-projects.response.ts';

export interface ListCycleProjectIssuesParams {
  teamId: string;
  projectId: string;
}

export class ListCycleProjectIssuesUsecase
  implements Usecase<ListCycleProjectIssuesParams, CycleProjectIssuesResponse>
{
  constructor(private readonly gateway: TopCycleProjectsGateway) {}

  async execute(
    params: ListCycleProjectIssuesParams,
  ): Promise<CycleProjectIssuesResponse> {
    return this.gateway.fetchCycleProjectIssues({
      teamId: params.teamId,
      projectId: params.projectId,
    });
  }
}
